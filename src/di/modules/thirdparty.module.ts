import { ContainerModule, interfaces } from 'inversify';

import { TYPES } from 'di/types';
import { RedisClient } from 'configs/redis.config';
import { RateLimitHandler, SessionHandler, AuthHandler } from 'middlewares';

const initializeModule = (bind: interfaces.Bind) => {
  bind(TYPES.RedisClient).to(RedisClient);
  bind(TYPES.AuthHandler).to(AuthHandler);
  bind(TYPES.SessionHandler).to(SessionHandler);
  bind(TYPES.RateLimitHandler).to(RateLimitHandler);
};

export const ThirdpartyModule = new ContainerModule(initializeModule);
