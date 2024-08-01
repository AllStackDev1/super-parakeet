import request from 'supertest';
import { Express } from 'express';
import { NOT_FOUND, OK } from 'http-status';

import { TestContext } from './test.context';

import { App } from 'app';
import { AuthController, UserController } from 'controllers';

describe('Server Start', () => {
  let app: Express;
  beforeAll(async () => {
    const testContext = new TestContext();
    testContext.mock<AuthController>(() => ({}), AuthController);
    testContext.mock<UserController>(() => ({}), UserController);
    const _app = testContext.get(App);
    await _app.initialize();
    app = _app.app;
  });

  it('responds with a not found message', async () => {
    const response = await request(app)
      .get('/not-found')
      .set('Accept', 'application/json')
      .expect(NOT_FOUND);

    expect(response.body.message).toEqual(
      "Can't find /not-found on this server",
    );
  });

  it('responds with a health status', async () => {
    const response = await request(app)
      .get('/health-check')
      .set('Accept', 'application/json')
      .expect(OK);

    expect(response.body).toEqual({ status: 'success', health: '100%' });
  });
});
