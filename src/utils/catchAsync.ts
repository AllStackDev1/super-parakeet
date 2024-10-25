import { Request, Response, NextFunction } from 'express';

export type RouteHandler = [req: Request, res: Response, next: NextFunction];

export const catchAsync = (fn: (...rest: RouteHandler) => void) => {
  const errorHandler = (...rest: RouteHandler) => {
    Promise.resolve(fn(...rest)).catch(rest[2]);
  };
  return errorHandler;
};
