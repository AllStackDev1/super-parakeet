import { inject, injectable, decorate } from 'inversify';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import { Request, Response, NextFunction } from 'express';
import { INTERNAL_SERVER_ERROR, TOO_MANY_REQUESTS } from 'http-status';

import { TYPES } from 'di/types';
import { RedisService } from 'services';

decorate(injectable(), RateLimiterRedis);

@injectable()
export class RateLimitHandler extends RateLimiterRedis {
  constructor(
    @inject(TYPES.RedisService)
    private redisService: RedisService,
  ) {
    super({
      storeClient: redisService.getClient({
        enableOfflineQueue: false,
      }),
      keyPrefix: 'rate-limit',
      points: 5,
      duration: 1,
    });

    this.handler = this.handler.bind(this);
  }

  async handler(req: Request, res: Response, next: NextFunction) {
    try {
      await this.consume(req.ip!);
      next();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (rejRes: any) {
      if (rejRes instanceof Error) {
        logger.error(rejRes.message, rejRes);
        res
          .status(INTERNAL_SERVER_ERROR)
          .json({ success: false, message: 'Server error, try again.' });
      } else {
        const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
        res.set('Retry-After', String(secs));
        res
          .status(TOO_MANY_REQUESTS)
          .send({ status: 'error', message: 'Too Many Requests' });
      }
    }
  }
}
