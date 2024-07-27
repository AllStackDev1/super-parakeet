declare global {
  namespace NodeJS {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      PORT?: string;
      DB_HOST: string;
      DB_PORT: string;
      DB_NAME: string;
      DB_USERNAME: string;
      DB_PASSWORD: string;
      // Add other environment variables here
    }
  }
}

export {};
