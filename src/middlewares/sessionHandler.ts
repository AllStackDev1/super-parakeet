import { Redis } from 'ioredis';
import session from 'express-session';
import RedisStore from 'connect-redis';

import { isProd, SESSION_SECRET } from 'configs/env.config';
import { inject, injectable } from 'inversify';
import { TYPES } from 'di/types';
import { RedisClient } from 'configs/redis.config';
import { NextFunction, Request, Response } from 'express';

export const sessionHandler = (client: Redis) => {
  // Initialize store.
  const redisStore = new RedisStore({
    client,
    prefix: 'myapp:super-parakeet',
  });

  return session({
    cookie: {
      secure: isProd || 'auto',
      httpOnly: true,
      maxAge: 1000 * 60,
      sameSite: isProd ? 'none' : 'lax',
    },
    store: redisStore,
    resave: false, // required: force lightweight session keep alive (touch)
    saveUninitialized: false, // recommended: only save session when data exists
    secret: SESSION_SECRET,
  });
};

@injectable()
export class SessionHandler extends RedisStore {
  constructor(@inject(TYPES.RedisClient) private redisClient: RedisClient) {
    super({
      client: redisClient.get(),
      prefix: 'myapp:super-parakeet',
    });

    this.handler = this.handler.bind(this);
  }

  async handler(req: Request, res: Response, next: NextFunction) {
    return session({
      cookie: {
        secure: isProd || 'auto',
        httpOnly: true,
        maxAge: 1000 * 60,
        sameSite: isProd ? 'none' : 'lax',
      },
      store: this,
      resave: false, // required: force lightweight session keep alive (touch)
      saveUninitialized: false, // recommended: only save session when data exists
      secret: SESSION_SECRET,
    }).call(this, req, res, next);
  }
}
