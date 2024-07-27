import dotenv from 'dotenv';
dotenv.config({ path: `${process.cwd()}/.env` });

export const TEST = process.env.NODE_ENV === 'test';
export const DEV = process.env.NODE_ENV === 'development';
export const PROD = process.env.NODE_ENV === 'production';

export const serverConfig = {
  host: process.env.SERVER_HOSTNAME || 'localhost',
  port: process.env.SERVER_PORT ? Number(process.env.SERVER_PORT) : 8000,
};

export const dbConfig = {
  port: Number(process.env.DB_PORT),
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
};
