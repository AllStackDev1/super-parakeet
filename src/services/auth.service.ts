/* eslint-disable @typescript-eslint/no-explicit-any */
import { injectable, inject } from 'inversify';

import { UserRepository } from 'repositories';
import { TYPES } from 'di/types';

export enum RegisterResult {
  Success = 'Success',
  EmailTaken = 'Email already taken',
}

export interface IAuthService {
  login(dto: any): Promise<RegisterResult>;
  register(dto: any): Promise<any>;
}

@injectable()
export class AuthService implements IAuthService {
  // private readonly salt = 10;

  constructor(
    @inject(TYPES.UserRepository)
    private _repo: UserRepository,
  ) {}

  public async register(dto: any) {
    const isEmailTaken = await this._repo?.getOne({ email: dto.email });
    if (isEmailTaken) {
      return RegisterResult.EmailTaken;
    }

    // data.password = await this.bcrypt.hash(dto.password, this.salt);
    await this._repo?.create(dto);
    return RegisterResult.Success;
  }

  public async login(dto: any) {
    /* const user = await this.repo.findOne({ email: dto.email });
    if (user) {
      const isPasswordMatch = await this.bcrypt.compare(
        dto.password,
        user.password,
      );
      if (isPasswordMatch) {
        const token = this.tokenService.create(user);
        const userDto = this.modelToDto(user);
        return {
          tokenInfo: token,
          user: userDto,
        };
      }
    } */
    return dto;
  }
}
