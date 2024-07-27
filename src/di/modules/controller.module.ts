import { ContainerModule, interfaces } from 'inversify';
import { AuthController, UserController } from 'controllers';

const initializeModule = (bind: interfaces.Bind) => {
  bind<AuthController>(AuthController).toSelf();
  bind<UserController>(UserController).toSelf();
};

export const ControllerModule = new ContainerModule(initializeModule);
