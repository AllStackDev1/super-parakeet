import helmet from 'helmet';
import http from 'node:http';
import express from 'express';
import { inject, injectable } from 'inversify';
import { NOT_FOUND, OK } from 'http-status';

import 'configs/logger';
import { serverConfig, isTest } from 'configs/env';

import connection from 'db/models/connection';

import {
  corsHandler,
  defineRoutes,
  loggerHandler,
  globalErrorHandler,
} from 'middlewares';
import { catchAsync, AppError } from 'utils';

import { AuthController, UserController } from 'controllers';
import { TYPES } from 'di/types';

@injectable()
export class App {
  public app = express();
  private httpServer: ReturnType<typeof http.createServer> | undefined;
  private isInitialized: boolean = false;

  constructor(
    @inject(TYPES.AuthController)
    private authController: AuthController,
    @inject(TYPES.UserController)
    private userController: UserController,
  ) {}

  public async initialize() {
    await this.syncModelToDatabase();
    this.setExpressSettings();
    this.initializePreMiddlewares();
    this.initializeControllers();
    this.initializePostMiddlewares();
    this.isInitialized = true;
  }

  public start() {
    if (!this.isInitialized) {
      throw new AppError('Call initialize() before.', 500);
    }
    logger.log('----------------------------------------');
    logger.log('Starting Server');
    logger.log('----------------------------------------');
    this.httpServer = http.createServer(this.app);
    this.httpServer.listen(serverConfig.port, () => {
      logger.log('----------------------------------------');
      logger.log(`Server started on ${serverConfig.host}:${serverConfig.port}`);
      logger.log('----------------------------------------');
    });
  }

  public stop(callback: (err?: Error) => void) {
    this.httpServer?.close(callback);
  }

  private setExpressSettings() {
    logger.log('----------------------------------------');
    logger.log('Initializing API');
    logger.log('----------------------------------------');
    this.app.use(helmet());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(express.json());
    this.app.disable('x-powered-by');
  }

  private initializePreMiddlewares() {
    logger.log('----------------------------------------');
    logger.log('Logging & Configuration');
    logger.log('----------------------------------------');
    this.app.use(loggerHandler);
    this.app.use(corsHandler);
  }

  private initializeControllers() {
    logger.log('----------------------------------------');
    logger.log('Define Routes & Controllers');
    logger.log('----------------------------------------');
    this.app.get('/health-check', (_, res) => {
      return res.status(OK).json({ status: 'success', health: '100%' });
    });
    defineRoutes([this.authController, this.userController], this.app);
    this.app.use(
      '*',
      catchAsync(async (req) => {
        throw new AppError(
          `Can't find ${req.originalUrl} on this server`,
          NOT_FOUND,
        );
      }),
    );
  }

  private async syncModelToDatabase() {
    logger.log('----------------------------------------');
    logger.log('Synchronizes the database with the defined models');
    logger.log('----------------------------------------');
    if (isTest) {
      await connection.sync({ force: true });
    } else {
      await connection.sync();
    }
  }

  private initializePostMiddlewares(): void {
    logger.log('----------------------------------------');
    logger.log('Define Global Error Handler');
    logger.log('----------------------------------------');
    this.app.use(globalErrorHandler);
  }
}
