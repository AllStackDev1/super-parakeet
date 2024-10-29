import { ContainerModule, interfaces } from 'inversify';
import { UserRepository } from 'repositories';

import { TYPES } from 'di/types';

const initializeModule = (bind: interfaces.Bind) => {
  bind<UserRepository>(TYPES.UserRepository)
    .to(UserRepository)
    .inSingletonScope();
};

export const RepositoriesModule = new ContainerModule(initializeModule);
