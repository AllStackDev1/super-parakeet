import 'reflect-metadata';

import request from 'supertest';
import { Express } from 'express';
import EventEmitter from 'node:events';
import { NOT_FOUND, OK } from 'http-status';

import { container } from 'di/container';

import { App } from 'app';
import { TYPES } from 'di/types';

// Fix EventEmitter inheritance issue for tests
Object.getPrototypeOf(EventEmitter.prototype).constructor = Object;

describe('Testing App', () => {
  let app: App;
  let express: Express;

  beforeAll(async () => {
    app = container.get(App);
    await app.initialize();
    express = container.get(TYPES.Express);
  });

  afterAll(async () => {
    await app?.shutdown(() => {});
  });

  it('Starts and has the proper test environment', async () => {
    expect(process.env.NODE_ENV).toBe('test');
    expect(express).toBeDefined();
  });

  it('responds with a not found message', async () => {
    const response = await request(express)
      .get('/not-found')
      .set('Accept', 'application/json')
      .expect(NOT_FOUND);

    expect(response.body.message).toEqual(
      "Can't find /not-found on this server",
    );
  });

  it('responds with a health status', async () => {
    const response = await request(express)
      .get('/health-check')
      .set('Accept', 'application/json')
      .expect(OK);

    expect(response.body).toEqual({ status: 'success', health: '100%' });
  });
});
