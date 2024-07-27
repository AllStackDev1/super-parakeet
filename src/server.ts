// if (process.env.NODE_ENV === 'production') {
//   require('module-alias/register');
// }
import 'reflect-metadata';
import { container } from 'di/container';
import { App } from 'app';

const app = container.getInjector(App);

(async () => {
  await app.initialize();
  app.start();
})();
