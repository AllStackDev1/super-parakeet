import { inject, injectable } from 'inversify';
import { UNAUTHORIZED } from 'http-status';
import { Request, Response, NextFunction } from 'express';

import { UserModel } from 'db/models';
import { AppError, catchAsync } from 'utils';
import { TYPES } from 'di/types';
import { IAuthService, RedisService } from 'services';

declare module 'express-session' {
  interface SessionData {
    user: Partial<UserModel>;
    authorized: boolean;
  }
}

declare module 'express' {
  interface Request {
    user?: Partial<UserModel>;
  }
}

@injectable()
export class AuthHandler {
  constructor(
    @inject(TYPES.AuthService)
    private authService: IAuthService,
    @inject(TYPES.RedisService) private redisService: RedisService,
  ) {
    this.handler = this.handler.bind(this);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async authenticateToken(req: Request, _: Response) {
    if (req.headers.authorization?.startsWith('Bearer')) {
      const accessToken = req.headers.authorization.split(' ')[1];
      if (!accessToken) {
        throw new AppError('Please login to gain access', UNAUTHORIZED);
      }
      // verify access token
      const { decoded, error } =
        await this.authService.validateJWT(accessToken);

      if (!error) {
        const storedUser = (await this.redisService
          .getClient()
          .get(decoded?.sub as string)) as string;

        if (!storedUser) {
          throw new AppError(
            'Access token expired. Please request a new one using your refresh token.',
            UNAUTHORIZED,
            null,
            'TOKEN_EXPIRED',
          );
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { refreshToken: _, ...user } = JSON.parse(storedUser);

        req.user = user;
        req.session.user = user;
        return;
      }
    }

    // if no access token in header, check for refresh token in cookies
    // and ask client to request a new access token
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      const { error } = await this.authService.validateJWT(refreshToken);

      if (!error) {
        // Instead of creating a new access token here, instruct the client to request one
        throw new AppError(
          'Access token expired. Please request a new one using your refresh token.',
          UNAUTHORIZED,
          null,
          'TOKEN_EXPIRED',
        );
      }
    }

    throw new AppError('Please login to gain access', UNAUTHORIZED);
  }

  public async handler() {
    return catchAsync(
      async (req: Request, res: Response, next: NextFunction) => {
        const user = req.session.user;
        const authorized = req.session.authorized;
        if (authorized && user) {
          return next();
        }
        await this.authenticateToken(req, res);
        next();
      },
    );
  }
}
