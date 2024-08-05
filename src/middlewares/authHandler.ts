import jwt from 'jsonwebtoken';
import { UNAUTHORIZED } from 'http-status';
import { Request, Response, NextFunction } from 'express';

import { UserModel } from 'db/models';
import { jwtConfig } from 'configs/env.config';
import { AppError, catchAsync } from 'utils';

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

async function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  let token: string = req.cookies.auth_token;

  if (!token && req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Please login to gain access', UNAUTHORIZED));
  }

  const tokenDetails = jwt.verify(token, jwtConfig.secretKey);

  const user = await UserModel.findByPk(tokenDetails?.sub as string);

  if (!user) {
    return next(new AppError('Could not find user', 400));
  }
  req.user = user;
  req.session.user = user;
  next(); // Continue to the protected route
}

export const authHandler = catchAsync(
  (req: Request, res: Response, next: NextFunction) => {
    const user = req.session.user;
    const authorized = req.session.authorized;
    if (authorized && user) {
      return next();
    }
    return authenticateToken(req, res, next);
  },
);
