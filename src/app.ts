import helmet from 'helmet';
import { Server } from 'node:http';
import cookieParser from 'cookie-parser';
import express, { Express } from 'express';
import { NOT_FOUND, OK } from 'http-status';
import { inject, injectable } from 'inversify';

import 'configs/logger.config';

import { serverConfig, isTest, cookiesConfig } from 'configs/env.config';

import sequelize from 'configs/sequelize.config';

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

import { SocketService, RedisService } from 'services';
import { AuthController, UserController } from 'controllers';

@injectable()
export class App {
  private isInitialized: boolean = false;

  constructor(
    @inject(TYPES.Server)
    private server: Server,
    @inject(TYPES.Express)
    private express: Express,
    @inject(TYPES.SocketService)
    private socketService: SocketService,
    @inject(TYPES.AuthController)
    private authController: AuthController,
    @inject(TYPES.UserController)
    private userController: UserController,
    @inject(TYPES.RateLimitHandler)
    private rateLimitHandler: RateLimitHandler,
    @inject(TYPES.SessionHandler)
    private sessionHandler: SessionHandler,
    @inject(TYPES.RedisService)
    private redisService: RedisService,
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
    this.server.listen(serverConfig.port, () => {
      logger.log('----------------------------------------');
      logger.log(`Server started on ${serverConfig.host}:${serverConfig.port}`);
      logger.log('----------------------------------------');

      // Initialize Socket.IO listeners
      logger.log('----------------------------------------');
      logger.log('Initialize Socket.IO listeners');
      logger.log('----------------------------------------');
      this.socketService.setupListeners();
    });
  }

  public async shutdown(callback: (err?: Error) => void) {
    await this.redisService.close();
    await sequelize.close();
    this.server?.close(callback);
  }

  private setExpressSettings() {
    logger.log('----------------------------------------');
    logger.log('Initializing API');
    logger.log('----------------------------------------');
    this.express.use(helmet());
    this.express.use(cookieParser(cookiesConfig.secretKey));
    this.express.use(express.urlencoded({ extended: true }));
    this.express.use(express.json());
    this.express.disable('x-powered-by');
  }

  private initializePreMiddlewares() {
    logger.log('----------------------------------------');
    logger.log('Configuration Pre Middlewares');
    logger.log('----------------------------------------');
    this.express.use(corsHandler);
    this.express.use(this.sessionHandler.handler);
    this.express.use(this.rateLimitHandler.handler);
    this.express.use(loggerHandler);
  }

  private initializeControllers() {
    logger.log('----------------------------------------');
    logger.log('Define Routes & Controllers');
    logger.log('----------------------------------------');
    this.express.get('/health-check', (_, res) => {
      res.status(OK).json({ status: 'success', health: '100%' });
    });
    defineRoutes([this.authController, this.userController], this.express);
    this.express.use(
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
      await sequelize.sync({ force: true });
    } else {
      await sequelize.sync();
    }
  }

  private initializePostMiddlewares(): void {
    logger.log('----------------------------------------');
    logger.log('Configuration Post Middlewares');
    logger.log('----------------------------------------');
    this.express.use(globalErrorHandler);
  }
}
