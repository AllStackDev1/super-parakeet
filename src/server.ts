import 'reflect-metadata';
import { Container } from 'di/container';

(async () => {
  const container = new Container();
  const app = container.getApp();
  await app.initialize();
  app.start();
})();
