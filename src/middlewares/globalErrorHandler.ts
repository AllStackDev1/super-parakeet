import { NextFunction, Request, Response } from 'express';

import { AppError } from 'utils';
import { isProd } from 'configs/env.config';
import { FORBIDDEN, INTERNAL_SERVER_ERROR } from 'http-status';

const sendErrorDev = (err: AppError, res: Response) => {
  const statusCode = err.statusCode || INTERNAL_SERVER_ERROR;
  const status = err.status || 'error';
  const message = err.message;
  const errors = err.errors;
  const stack = err.stack;
  const code = err.code;

  return res.status(statusCode).json({
    status,
    message,
    errors,
    code,
    stack,
  });
};

const sendErrorProd = (err: AppError, res: Response) => {
  const statusCode = err.statusCode || INTERNAL_SERVER_ERROR;
  const IsOperational = err.IsOperational;
  const status = err.status || 'error';
  const message = err.message;
  const errors = err.errors;

  if (IsOperational) {
    res.status(statusCode).json({
      status,
      message,
      errors,
    });
  }

  logger.error(err);

  res.status(INTERNAL_SERVER_ERROR).json({
    status: 'error',
    message: 'Something went very wrong',
  });
};

export function globalErrorHandler(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  err: any,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction, // this is needed
) {
  if (err.name === 'SequelizeValidationError') {
    err = new AppError(err.errors[0].message, 400);
  }

  if (err.name === 'SequelizeUniqueContraintError') {
    err = new AppError('Invalid token', 401);
  }

  if (err.name === 'JsonWebTokenError') {
    err = new AppError('Token is invalid', FORBIDDEN);
  }

  if (isProd) {
    return sendErrorProd(err, res);
  }
  sendErrorDev(err, res);
}
