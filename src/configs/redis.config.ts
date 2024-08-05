import Redis, { RedisOptions } from 'ioredis';

import { redisConfig } from './env.config';
import { injectable } from 'inversify';

export const client = new Redis(redisConfig.url);

@injectable()
export class RedisClient {
  private _client?: Redis;

  get(opts?: RedisOptions) {
    this._client = this._client || this.createClient(opts);

    return this._client;
  }

  close() {
    this.get().disconnect();
  }

  private createClient(opts?: RedisOptions) {
    const retryStrategy = (attempts: number) => {
      const delay = Math.min(attempts * 1000, 15000);
      return delay;
    };

    const redisClient = new Redis({
      host: redisConfig.host,
      port: redisConfig.port,
      username: redisConfig.username,
      password: redisConfig.password,
      showFriendlyErrorStack: true,
      retryStrategy,
      enableOfflineQueue: false,
      maxRetriesPerRequest: null,
      db: 0,
      ...opts,
    });

    redisClient.on('error', (err) => {
      logger.error({ err }, 'Redis client connection error');
    });

    redisClient.on('ready', () => {
      logger.info('Redis client is ready');
    });

    redisClient.on('reconnecting', () => {
      logger.info('Redis client is reconnected');
    });

    return redisClient;
  }
}
