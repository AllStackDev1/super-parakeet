import { Redis } from 'ioredis';
import session from 'express-session';
import RedisStore from 'connect-redis';
import { inject, injectable } from 'inversify';
import { NextFunction, Request, Response } from 'express';

import { TYPES } from 'di/types';
import { RedisService } from 'services';
import { isProd, SESSION_SECRET } from 'configs/env.config';

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
  constructor(@inject(TYPES.RedisService) private redisService: RedisService) {
    super({
      client: redisService.getClient(),
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
