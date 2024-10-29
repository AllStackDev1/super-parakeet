import {
  CONFLICT,
  FORBIDDEN,
  BAD_REQUEST,
  UNAUTHORIZED,
  UNPROCESSABLE_ENTITY,
  INTERNAL_SERVER_ERROR,
} from 'http-status';
import { Redis } from 'ioredis';
import { Response } from 'express';
import { verify, decode, JwtPayload } from 'jsonwebtoken';
import { injectable, inject } from 'inversify';
import { CacheUpdate } from '@type-cacheable/core';
import { useAdapter } from '@type-cacheable/ioredis-adapter';

import { TYPES } from 'di/types';
import { UserModelDto } from 'db/models';
import { AppError, exclude } from 'utils';
import { BaseService } from './base.service';
import { UserRepository } from 'repositories';
import { cookiesConfig, jwtConfig } from 'configs/env.config';
import type {
  EmailSchema,
  LoginSchema,
  SignupSchema,
  ResetPasswordSchema,
  RefreshTokenSchema,
} from 'validators';

import { RedisService } from './redis.service';

const REDIS_BUFFER = 3 * 60;

export interface IAuthService {
  register(dto: SignupSchema): Promise<
    | AppError
    | {
        name: string;
        email: string;
      }
  >;
  validateJWT(
    token: string,
  ): Promise<{ decoded: JwtPayload | null; error?: unknown }>;
  authenticate(
    dto: LoginSchema,
  ): Promise<{ user: UserModelDto; accessToken: string; refreshToken: string }>;
  refreshAccessToken(
    res: Response,
    dto: RefreshTokenSchema,
  ): Promise<{ user: UserModelDto; accessToken: string; refreshToken: string }>;
  sendPasswordResetEmail(payload: EmailSchema): Promise<{ message: string }>;
  resetPassword(payload: ResetPasswordSchema): Promise<{ message: string }>;
}

@injectable()
export class AuthService extends BaseService implements IAuthService {
  private _redisClient: Redis;
  constructor(
    @inject(TYPES.UserRepository)
    private repo: UserRepository,
    @inject(TYPES.RedisService)
    private redisService: RedisService,
  ) {
    super();

    this._redisClient = this.redisService.getClient({
      enableOfflineQueue: true,
    });

    useAdapter(this._redisClient, false);

    this.on('user_login', async () => {});
    this.on('new_sign_up', async () => {});
    this.on('user_failed_login', async () => {});
  }

  public async validateJWT(token?: string) {
    let response: {
      decoded: JwtPayload | null;
      error?: unknown;
    } = { decoded: null, error: new Error('No token provided') };

    if (!token) return response;

    try {
      const decoded = verify(token, jwtConfig.secretKey) as JwtPayload;
      response = { decoded, error: null };
    } catch (error) {
      response = { decoded: decode(token) as JwtPayload, error };
    }

    return response;
  }

  private async handleInvalidSession(res: Response, userId?: string) {
    // Clear refresh token from Redis
    if (userId) {
      await this._redisClient.del(`${userId}`);
    }

    // Clear cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });

    throw new AppError('Invalid session', UNAUTHORIZED);
  }

  @CacheUpdate({
    cacheKey: (_, __, result) => result.id,
    cacheKeysToClear: ['users'],
  })
  public async register(dto: SignupSchema) {
    let user = await this.repo.getOne({ email: dto.email });
    if (user) {
      throw new AppError('A user with this email already exist', CONFLICT);
    }
    user = await this.repo.create(dto);
    return { name: user.getFullname(), email: user.email };
  }

  public async authenticate(dto: LoginSchema) {
    const user = await this.repo.getOne(
      { email: dto.email },
      {
        attributes: { include: ['password'] },
      },
    );
    if (user && (await user.isPasswordMatch(dto.password))) {
      const accessToken = user.generateJWT('access');
      const refreshToken = user.generateJWT('refresh');

      this._redisClient.set(
        `${user.id}`,
        JSON.stringify({ ...user, refreshToken }),
        'EX',
        +cookiesConfig.maxAge / 1000 + REDIS_BUFFER,
      );

      return {
        user: exclude(user.toJSON(), [
          'password',
          'updatedAt',
          'createdAt',
          'deletedAt',
        ]),
        accessToken,
        refreshToken,
      };
    }
    throw new AppError('Invalid email or password', BAD_REQUEST);
  }

  public async refreshAccessToken(
    res: Response,
    { refreshToken }: RefreshTokenSchema,
  ) {
    if (!refreshToken)
      throw new AppError('No refresh token provided', FORBIDDEN);

    const { decoded, error } = await this.validateJWT(refreshToken);

    if (error) {
      await this.handleInvalidSession(res, decoded?.sub);
    }

    // Check if token exists in Redis
    const storedUser = await this._redisClient.get(`${decoded?.sub}`);

    if (!storedUser) {
      await this.handleInvalidSession(res, decoded?.sub);
    }

    // convert storedUser string to object
    const { refreshToken: storedToken } = JSON.parse(storedUser as string);

    if (storedToken !== refreshToken) {
      await this.handleInvalidSession(res, decoded?.sub);
    }

    const user = await this.repo.getById(decoded?.sub as string);

    if (!user) throw new AppError('User not found', UNAUTHORIZED);

    // clear previous redis store
    await this._redisClient.del(`${user.id}`);

    const accessToken = user.generateJWT('access');
    const newRefreshToken = user.generateJWT('refresh');

    this._redisClient.set(
      `${user.id}`,
      JSON.stringify({ ...user, refreshToken: newRefreshToken }),
      'EX',
      +cookiesConfig.maxAge / 1000 + REDIS_BUFFER,
    );

    return {
      user: exclude(user.toJSON(), [
        'password',
        'updatedAt',
        'createdAt',
        'deletedAt',
      ]),
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  public async sendPasswordResetEmail(payload: EmailSchema) {
    const user = await this.repo.getOne({ email: payload.email });
    if (user) {
      // TODO: send password reset email to user.email
    }
    return {
      message:
        'If the provided email is found in our system, you will receive an email with a link to reset your password',
    };
  }

  public async resetPassword(payload: ResetPasswordSchema) {
    const { decoded, error } = await this.validateJWT(payload.token);

    if (error) throw new AppError('Invalid token', UNPROCESSABLE_ENTITY);

    if (decoded?.sub) {
      const [no] = await this.repo.updateById(decoded.sub, {
        password: payload.newPassword,
      });
      if (no) {
        return { message: 'Your password has been succesfully updated.' };
      }
      throw new AppError(
        'We were unable to update account password, please try again.',
        INTERNAL_SERVER_ERROR,
      );
    }

    throw new AppError(
      'Reset token invalid or expired, request another',
      UNPROCESSABLE_ENTITY,
    );
  }
}
