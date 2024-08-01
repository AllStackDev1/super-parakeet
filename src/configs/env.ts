import dotenv from 'dotenv';
import { Options } from 'sequelize';
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

export const isTest = process.env.NODE_ENV === 'test';
export const isDev = process.env.NODE_ENV === 'development';
export const isProd = process.env.NODE_ENV === 'production';

export const serverConfig = {
  host: process.env.HOSTNAME || 'localhost',
  port: process.env.PORT ? Number(process.env.PORT) : 8000,
};

export const dbConfig: Options = {
  logging: isDev,
  dialect: 'postgres',
  host: process.env.DB_HOST,
  database: process.env.DB_NAME!,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME!,
  password: process.env.DB_PASSWORD!,
};

export const REDIS_URL = process.env.REDIS_URL!;

export const SESSION_SECRET = process.env.SESSION_SECRET!;

export const HASHING_SALT = process.env.HASHING_SALT!;
