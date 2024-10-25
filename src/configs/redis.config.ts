import Redis, { RedisOptions } from 'ioredis';

import { redisConfig } from './env.config';
import { injectable } from 'inversify';

@injectable()
export class RedisClient {
  private client?: Redis;

  /**
   *
   * @param opts RedisOptions
   * @returns Redis client
   */
  getClient(opts?: RedisOptions) {
    this.client = this.client || this.createClient(opts);

    return this.client;
  }

  close() {
    this.getClient().disconnect();
  }

  private createClient(opts?: RedisOptions) {
    const retryStrategy = (attempts: number) => {
      const delay = Math.min(attempts * 1000, 15000);
      return delay;
    };

    const redisClient = new Redis({
      retryStrategy,
      ...redisConfig,
      ...opts,
    });

    redisClient.on('error', (err) => {
      console.log(err);
      logger.error({ err }, 'Redis client connection error');
    });

    redisClient.on('ready', () => {
      logger.info('Redis client is ready');
    });

    redisClient.on('reconnecting', () => {
      logger.info('Redis client is reconnecting');
    });

    return redisClient;
  }
}
