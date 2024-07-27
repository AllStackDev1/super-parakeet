import { ContainerModule, interfaces } from 'inversify';

import { TYPES } from 'di/types';
import { AuthService, IAuthService } from 'services';

const initializeModule = (bind: interfaces.Bind) => {
  bind<IAuthService>(TYPES.AuthService).to(AuthService);
};

export const ServiceModule = new ContainerModule(initializeModule);
