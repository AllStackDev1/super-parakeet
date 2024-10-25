import 'reflect-metadata';
import { container } from 'di/container';
import { App } from 'app';

(async () => {
  const app = container.get(App);
  await app.initialize();
  app.start();
})();
