import { ContainerModule, interfaces } from 'inversify';
import { UserRepository, IRepository } from 'repositories';

import { TYPES } from 'di/types';
import { UserModel } from 'db/models';

const initializeModule = (bind: interfaces.Bind) => {
  bind<IRepository<UserModel>>(TYPES.UserRepository).toConstantValue(
    new UserRepository(UserModel),
  );
};

export const RepositoryModule = new ContainerModule(initializeModule);
