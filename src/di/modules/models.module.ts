import { ContainerModule, interfaces } from 'inversify';

import { TYPES } from 'di/types';
import { UserModel } from 'db/models';

const initializeModule = (bind: interfaces.Bind) => {
  bind(TYPES.UserModel).toFunction(UserModel);
};

export const ModelsModule = new ContainerModule(initializeModule);
