/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */
import { createDefaultPreset } from 'ts-jest';
import type { Config } from 'jest';

import { compilerOptions } from './tsconfig.json';

const config: Config = {
  preset: 'ts-jest',
  clearMocks: true,
  collectCoverage: true,
  coverageProvider: 'v8',
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  testTimeout: 30000,
  setupFilesAfterEnv: ['reflect-metadata'],
  modulePaths: [compilerOptions.baseUrl],
  coverageDirectory: './coverage',
  moduleFileExtensions: ['js', 'ts'],
  testPathIgnorePatterns: ['/node_modules/'],
  coveragePathIgnorePatterns: [
    'node_modules',
    'src/db/migrations',
    'src/db/seeders',
    'src/db/config.js',
    'src/tests',
  ],
  transform: {
    ...createDefaultPreset().transform,
  },
};

export default config;
