import { injectable, inject } from 'inversify';

import { TYPES } from 'di/types';
import { UserModel, UserModelDto } from 'db/models';
import { BaseRepository } from './base.repository';

@injectable()
export class UserRepository extends BaseRepository<UserModelDto, UserModel> {
  constructor(@inject(TYPES.UserModel) protected model: typeof UserModel) {
    super(model);
  }
}
