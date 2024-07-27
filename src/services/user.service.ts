import { injectable, inject } from 'inversify';

import { type IRepository, UserRepository } from 'repositories';
import { TYPES } from 'di/types';
import { UserModel } from 'db/models';
import { BaseService } from './base.service';

export interface IUserService {}

@injectable()
export class UserService
  extends BaseService<IRepository<UserModel>>
  implements IUserService
{
  constructor(
    @inject(TYPES.UserRepository)
    protected repo: UserRepository,
  ) {
    super(repo);
  }
}
