import { ContainerModule, interfaces } from 'inversify';

import { TYPES } from 'di/types';
import { RedisClient } from 'configs/redis.config';
import { RateLimitHandler, SessionHandler, AuthHandler } from 'middlewares';

const initializeModule = (bind: interfaces.Bind) => {
  bind(TYPES.RedisClient).to(RedisClient).inSingletonScope();
  bind(TYPES.AuthHandler).to(AuthHandler).inSingletonScope();
  bind(TYPES.SessionHandler).to(SessionHandler).inSingletonScope();
  bind(TYPES.RateLimitHandler).to(RateLimitHandler).inSingletonScope();
};

export const ThirdpartyModule = new ContainerModule(initializeModule);
