import {
  CONFLICT,
  BAD_REQUEST,
  UNPROCESSABLE_ENTITY,
  INTERNAL_SERVER_ERROR,
} from 'http-status';
import { injectable, inject } from 'inversify';
import { CacheUpdate } from '@type-cacheable/core';
import { useAdapter } from '@type-cacheable/ioredis-adapter';

import { TYPES } from 'di/types';
import { UserModelDto } from 'db/models';
import { AppError, exclude } from 'utils';
import { BaseService } from './base.service';
import { UserRepository } from 'repositories';
import { RedisClient } from 'configs/redis.config';
import type {
  EmailSchema,
  LoginSchema,
  SignupSchema,
  ResetPasswordSchema,
} from 'validators';

export interface IAuthService {
  register(dto: SignupSchema): Promise<
    | AppError
    | {
        name: string;
        email: string;
      }
  >;
  authenticate(
    dto: LoginSchema,
  ): Promise<{ user: UserModelDto; token: string }>;
  sendPasswordResetEmail(payload: EmailSchema): Promise<{ message: string }>;
  resetPassword(payload: ResetPasswordSchema): Promise<{ message: string }>;
}

@injectable()
export class AuthService extends BaseService implements IAuthService {
  constructor(
    @inject(TYPES.UserRepository)
    private repo: UserRepository,
    @inject(TYPES.RedisClient)
    redisClient: RedisClient,
  ) {
    super();

    useAdapter(
      redisClient.get({
        enableOfflineQueue: true,
      }),
      false,
    );

    this.on('user_login', async () => {});
    this.on('new_sign_up', async () => {});
    this.on('user_failed_login', async () => {});
  }

  private async validateJWT(token: string) {
    if (token) return token;

    return null;
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
    const user = await this.repo.getOne({ email: dto.email });
    if (user && (await user.isPasswordMatch(dto.password))) {
      const token = user.generateAuthToken('auth');
      return {
        user: exclude(user.toJSON(), [
          'password',
          'updatedAt',
          'createdAt',
          'deletedAt',
        ]),
        token,
      };
    }
    throw new AppError('Invalid email or password', BAD_REQUEST);
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
    const id = await this.validateJWT(payload.token);
    if (id) {
      const [no] = await this.repo.updateById(id, {
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
