import { BAD_REQUEST, NOT_FOUND } from 'http-status';
import { injectable, inject } from 'inversify';

import { TYPES } from 'di/types';
import { UserModel, UserModelDto } from 'db/models';
import { UserRepository } from 'repositories';
import { BaseService } from './base.service';
import { AppError } from 'utils';
import { type UpdateSchema, type QuerySchema } from 'validators';

export interface IUserService {
  getAllUsers(): Promise<{ data: UserModel[]; message: string }>;
  getUserById(id: string): Promise<UserModel | null>;
  getOneUser(
    query: Pick<UserModelDto, 'id' | 'email'>,
  ): Promise<UserModel | null>;
  getUsersBasedOnQuery(
    query: QuerySchema,
  ): Promise<{ data: UserModel[]; message: string }>;
  updateUser(id: string, payload: UpdateSchema): Promise<UserModel | null>;
  softDeleteUserById(id: string): Promise<number>;
}

@injectable()
export class UserService extends BaseService implements IUserService {
  constructor(
    @inject(TYPES.UserRepository)
    protected repo: UserRepository,
  ) {
    super();
  }

  public async getAllUsers() {
    const users = await this.repo.getAll();
    // run some formating and all need data manipulation
    return { data: users, message: `${users.length} users found.` };
  }

  public async getUsersBasedOnQuery(query: QuerySchema) {
    const users = await this.repo.query(query);
    // run some formating and all need data manipulation
    return { data: users, message: `${users.length} users found.` };
  }

  public async getUserById(id: string) {
    // run some formating and all need data manipulation
    const user = await this.repo.getById(id);
    if (user) return user;
    throw new AppError('No user found', NOT_FOUND);
  }

  public async getOneUser(
    query: { id: string; email: string } | { id?: string; email?: string },
  ) {
    const users = await this.repo.getOne(query);

    // run some formating and all need data manipulation
    return users;
  }

  public async updateUser(id: string, payload: UpdateSchema) {
    const [updatedRows] = await this.repo.update(id, payload);

    if (updatedRows) {
      return await this.getUserById(id);
    }
    throw new AppError('Unable to update, please try again.', BAD_REQUEST);
  }

  public async softDeleteUserById(id: string) {
    // run some events, add to queue for possible full on deletions after 30days
    return this.repo.delete(id);
  }
}
