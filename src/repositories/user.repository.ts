import { injectable, inject } from 'inversify';

import { UserModel } from 'db/models';
import { BaseRepository } from './base.repository';
import { TYPES } from 'di/types';

@injectable()
export default class extends BaseRepository<UserModel> {
  constructor(@inject(TYPES.UserModel) protected model: typeof UserModel) {
    super(model);
  }
}
