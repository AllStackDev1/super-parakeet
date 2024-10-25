import { ContainerModule, interfaces } from 'inversify';

import { TYPES } from 'di/types';
import { AuthService, IAuthService, UserService, IUserService } from 'services';

const initializeModule = (bind: interfaces.Bind) => {
  bind<IAuthService>(TYPES.AuthService).to(AuthService).inSingletonScope();
  bind<IUserService>(TYPES.UserService).to(UserService).inSingletonScope();
};

export const ServicesModule = new ContainerModule(initializeModule);
