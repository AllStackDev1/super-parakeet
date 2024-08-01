declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';

      PORT?: string;
      HOSTNAME: string;

      DB_HOST: string;
      DB_PORT: string;
      DB_NAME: string;
      DB_USERNAME: string;
      DB_PASSWORD: string;

      REDIS_URL: string;

      SESSION_SECRET: string;

      HASHING_SALT: string;

      // Add other environment variables here
    }
  }
}

export {};
