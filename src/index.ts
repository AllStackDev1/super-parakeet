import 'reflect-metadata';
import { container } from 'di/container';
import { App } from 'app';

const app = container.get(App);
app
  .initialize()
  .then(() => app.start())
  .catch((err) => {
    console.error('Failed to start the application:', err);
  });
