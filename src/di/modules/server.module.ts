import express, { Express } from 'express';
import { ContainerModule, interfaces } from 'inversify';
import { Server, createServer } from 'node:http';

import { TYPES } from 'di/types';

// Create Express app
const expressApp = express();

// Create the HTTP server instance
const httpServer: ReturnType<typeof createServer> | undefined =
  createServer(expressApp);

// Bind the HTTP server
const initializeModule = (bind: interfaces.Bind) => {
  bind<Express>(TYPES.Express).toConstantValue(expressApp);
  bind<Server>(TYPES.Server).toConstantValue(httpServer);
};

export const ServerModule = new ContainerModule(initializeModule);
