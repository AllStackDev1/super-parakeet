import { NextFunction, Request, Response } from 'express';

import { AppError } from 'utils';
import { PROD } from 'configs/env';
import { INTERNAL_SERVER_ERROR } from 'http-status';

const sendErrorDev = (err: AppError, res: Response) => {
  const statusCode = err.statusCode || INTERNAL_SERVER_ERROR;
  const status = err.status || 'error';
  const message = err.message;
  const errors = err.errors;
  const stack = err.stack;

  return res.status(statusCode).json({
    stack,
    status,
    errors,
    message,
  });
};

const sendErrorProd = (err: AppError, res: Response) => {
  const statusCode = err.statusCode || INTERNAL_SERVER_ERROR;
  const IsOperational = err.IsOperational;
  const status = err.status || 'error';
  const message = err.message;
  // const stack = err.stack;

  if (IsOperational) {
    return res.status(statusCode).json({
      status,
      message,
    });
  }

  logger.error(err);

  return res.status(INTERNAL_SERVER_ERROR).json({
    status: 'error',
    message: 'Something went very wrong',
  });
};

export function globalErrorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction, // this is needed
) {
  let error: AppError | null = null;

  if (err.code === 5001) {
    error = new AppError('', 500);
  }

  if (err.name === 'JsonWebTokenError') {
    err = new AppError('Invalid token', 401);
  }

  if (PROD) {
    return sendErrorProd(error || err, res);
  }
  sendErrorDev(err, res);
}
