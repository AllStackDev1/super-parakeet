import request from 'supertest';
import { Express } from 'express';
import { NOT_FOUND, OK } from 'http-status';

import { TestContext } from './test.context';

import { App } from 'app';

describe('Server Start', () => {
  let app: App;
  let express: Express;

  beforeAll(async () => {
    const testContext = new TestContext();
    app = testContext.get(App);
    await app.initialize();
    express = app._express;
  });

  afterAll((done) => {
    app.shutdown(done);
    done();
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
