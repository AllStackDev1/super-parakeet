import { ContainerModule, interfaces } from 'inversify';
import { UserRepository } from 'repositories';

import { TYPES } from 'di/types';

const initializeModule = (bind: interfaces.Bind) => {
  /* bind<IRepository<UserModel>>(TYPES.UserRepository).toConstantValue(
    new UserRepository(new UserModel()),
  ); */
  bind<UserRepository>(TYPES.UserRepository).to(UserRepository);
};

export const RepositoryModule = new ContainerModule(initializeModule);
