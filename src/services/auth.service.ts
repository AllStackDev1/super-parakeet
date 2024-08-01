import bcrypt from 'bcrypt';
import {
  CONFLICT,
  BAD_REQUEST,
  UNPROCESSABLE_ENTITY,
  INTERNAL_SERVER_ERROR,
} from 'http-status';
import { injectable, inject } from 'inversify';

import { TYPES } from 'di/types';
import { AppError } from 'utils';
import { UserModelDto } from 'db/models';
import { HASHING_SALT } from 'configs/env';
import { UserRepository } from 'repositories';
import type {
  EmailSchema,
  LoginSchema,
  SignupSchema,
  ResetPasswordSchema,
} from 'validators';

import { BaseService } from './base.service';

export interface IAuthService {
  register(dto: SignupSchema): Promise<
    | AppError
    | {
        name: string;
        email: string;
      }
  >;
  authenticate(dto: LoginSchema): Promise<UserModelDto | undefined>;
  sendPasswordResetEmail(payload: EmailSchema): Promise<{ message: string }>;
  resetPassword(payload: ResetPasswordSchema): Promise<{ message: string }>;
}

@injectable()
export class AuthService extends BaseService implements IAuthService {
  constructor(
    @inject(TYPES.UserRepository)
    private repo: UserRepository,
  ) {
    super();

    this.on('user_login', async () => {});
    this.on('new_sign_up', async () => {});
    this.on('user_failed_login', async () => {});
  }

  private async hashPassword(password: string) {
    return await bcrypt.hash(password, HASHING_SALT);
  }

  private async isPasswordMatch(p1: string, p2: string) {
    return await bcrypt.compare(p1, p2);
  }

  // private generateAuthToken(u: UserModelDto) {}

  private async validateJWT(token: string) {
    if (token) return token;

    return null;
  }

  public async register(dto: SignupSchema) {
    const isEmailTaken = await this.repo.getOne({ email: dto.email });
    if (isEmailTaken) {
      return new AppError('A user with this email already exist', CONFLICT);
    }

    const password = await this.hashPassword(dto.password);

    const user = await this.repo.create({ ...dto, password });

    return { name: `${user.firstName} ${user.lastName}`, email: user.email };
  }

  public async authenticate(dto: LoginSchema) {
    const user = await this.repo.getOne({ email: dto.email });
    if (user) {
      if (await this.isPasswordMatch(dto.password, user.password)) {
        /* const token = this.tokenService.create(user);
        const userDto = this.modelToDto(user);
        return {
          tokenInfo: token,
          user: userDto,
        }; */

        return user;
      }
    }
    new AppError('Invalid email or password', BAD_REQUEST);
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
      const password = await this.hashPassword(payload.newPassword);
      const [no] = await this.repo.update(id, { password });
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
