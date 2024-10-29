import { ContainerModule, interfaces } from 'inversify';
import { AuthController, UserController } from 'controllers';
import { TYPES } from 'di/types';

const initializeModule = (bind: interfaces.Bind) => {
  bind<AuthController>(TYPES.AuthController)
    .to(AuthController)
    .inSingletonScope();
  bind<UserController>(TYPES.UserController)
    .to(UserController)
    .inSingletonScope();
};

export const ControllersModule = new ContainerModule(initializeModule);
