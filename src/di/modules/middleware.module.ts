import { ContainerModule, interfaces } from 'inversify';

import { TYPES } from 'di/types';
import { RateLimitHandler, SessionHandler, AuthHandler } from 'middlewares';

const initializeModule = (bind: interfaces.Bind) => {
  bind(TYPES.AuthHandler).to(AuthHandler).inSingletonScope();
  bind(TYPES.SessionHandler).to(SessionHandler).inSingletonScope();
  bind(TYPES.RateLimitHandler).to(RateLimitHandler).inSingletonScope();
};

export const MiddlewareModule = new ContainerModule(initializeModule);
