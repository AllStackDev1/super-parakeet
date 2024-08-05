import helmet from 'helmet';
import http from 'node:http';
import express from 'express';
import cookieParser from 'cookie-parser';
import { NOT_FOUND, OK } from 'http-status';
import { inject, injectable } from 'inversify';

import 'configs/logger.config';

import { serverConfig, isTest, cookiesConfig } from 'configs/env.config';

import connection from 'db/models/connection';

import { catchAsync, AppError } from 'utils';
import {
  corsHandler,
  defineRoutes,
  loggerHandler,
  SessionHandler,
  RateLimitHandler,
  globalErrorHandler,
} from 'middlewares';

import { TYPES } from 'di/types';

import { AuthController, UserController } from 'controllers';

@injectable()
export class App {
  public _express = express();
  private httpServer: ReturnType<typeof http.createServer> | undefined;
  private isInitialized: boolean = false;

  constructor(
    @inject(TYPES.AuthController)
    private authController: AuthController,
    @inject(TYPES.UserController)
    private userController: UserController,
    @inject(TYPES.RateLimitHandler)
    private rateLimitHandler: RateLimitHandler,
    @inject(TYPES.SessionHandler)
    private sessionHandler: SessionHandler,
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
    this.httpServer = http.createServer(this._express);
    this.httpServer.listen(serverConfig.port, () => {
      logger.log('----------------------------------------');
      logger.log(`Server started on ${serverConfig.host}:${serverConfig.port}`);
      logger.log('----------------------------------------');
    });
  }

  public stop(callback: (err?: Error) => void) {
    connection.close();
    this.httpServer?.close(callback);
  }

  private setExpressSettings() {
    logger.log('----------------------------------------');
    logger.log('Initializing API');
    logger.log('----------------------------------------');
    this._express.use(helmet());
    this._express.use(cookieParser(cookiesConfig.secretKey));
    this._express.use(express.urlencoded({ extended: true }));
    this._express.use(express.json());
    this._express.disable('x-powered-by');
  }

  private initializePreMiddlewares() {
    logger.log('----------------------------------------');
    logger.log('Configuration Pre Middlewares');
    logger.log('----------------------------------------');
    this._express.use(corsHandler);
    this._express.use(this.sessionHandler.handler);
    this._express.use(this.rateLimitHandler.handler);
    this._express.use(loggerHandler);
  }

  private initializeControllers() {
    logger.log('----------------------------------------');
    logger.log('Define Routes & Controllers');
    logger.log('----------------------------------------');
    this._express.get('/health-check', (_, res) => {
      return res.status(OK).json({ status: 'success', health: '100%' });
    });
    defineRoutes([this.authController, this.userController], this._express);
    this._express.use(
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
    logger.log('Configuration Post Middlewares');
    logger.log('----------------------------------------');
    this._express.use(globalErrorHandler);
  }
}
