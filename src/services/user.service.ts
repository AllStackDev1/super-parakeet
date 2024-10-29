import qs from 'node:querystring';
import { injectable, inject } from 'inversify';
import { BAD_REQUEST, NOT_FOUND } from 'http-status';
import { useAdapter } from '@type-cacheable/ioredis-adapter';
import { Cacheable, CacheClear, CacheUpdate } from '@type-cacheable/core';

import { TYPES } from 'di/types';
import { AppError, exclude } from 'utils';
import { BaseService } from './base.service';
import { UserRepository } from 'repositories';
import { RedisService } from './redis.service';
import { UserModel, UserModelDto } from 'db/models';
import type { UserUpdateSchema, UserQuerySchema } from 'validators';

export interface IUserService {
  getAllUsers(): Promise<{ data: UserModelDto[]; message: string }>;
  getUserById(id: string): Promise<UserModelDto | null>;
  getUsersByQuery(
    query: UserQuerySchema,
  ): Promise<{ data: UserModelDto[]; message: string }>;
  update(id: string, payload: UserUpdateSchema): Promise<UserModelDto | null>;
  softDeleteById(id: string): Promise<number>;
  forceDeleteById(id: string): Promise<number>;
}

@injectable()
export class UserService extends BaseService implements IUserService {
  constructor(
    @inject(TYPES.UserRepository)
    protected repo: UserRepository,
    @inject(TYPES.RedisService)
    redisService: RedisService,
  ) {
    super();
    useAdapter(
      redisService.getClient({
        enableOfflineQueue: true,
      }),
      false,
      { ttlSeconds: 3600 },
    );
  }

  private dto(user: UserModel) {
    const keys = [
      ...new Set<keyof UserModelDto>([
        !user.dateOfBirth ? 'dateOfBirth' : 'password',
        !user.deletedAt ? 'deletedAt' : 'password',
        'password',
      ]),
    ];
    return exclude(user.toJSON(), keys);
  }

  @Cacheable({ cacheKey: 'users' })
  public async getAllUsers() {
    const users = await this.repo.getAll();
    // run some formating and all need data manipulation
    return {
      data: users.map(this.dto),
      message: `${users.length} user${users.length > 1 ? 's' : ''} found.`,
    };
  }

  @Cacheable({
    cacheKey: (args) => qs.stringify(args[0]),
  })
  public async getUsersByQuery(query: UserQuerySchema) {
    const users = await this.repo.getAll(query);
    // run some formating and all need data manipulation
    return {
      data: users.map(this.dto),
      message: `${users.length} user${users.length > 1 ? 's' : ''} found.`,
    };
  }

  @Cacheable({ cacheKey: ([id]) => id })
  public async getUserById(id: string) {
    // run some formating and all need data manipulation
    const user = await this.repo.getById(id);
    if (user) return this.dto(user);
    throw new AppError('No user found', NOT_FOUND);
  }

  @CacheUpdate({
    cacheKey: (args, ctx, result) => result.id,
    cacheKeysToClear: () => ['users'],
  })
  public async update(id: string, payload: UserUpdateSchema) {
    const [updatedRows] = await this.repo.updateById(id, payload);

    if (updatedRows) {
      const user = await this.repo.getById(id);
      if (user) return this.dto(user);
    }
    throw new AppError('Unable to update, please try again.', BAD_REQUEST);
  }

  @CacheClear({ cacheKey: ([id]) => [id, 'users'] })
  public async softDeleteById(id: string) {
    // run some events, add to queue for possible full on deletions after 30days
    return this.repo.deleteById(id);
  }

  @CacheClear({ cacheKey: ([id]) => [id, 'users'] })
  public async forceDeleteById(id: string) {
    return this.repo.deleteById(id, true);
  }
}
