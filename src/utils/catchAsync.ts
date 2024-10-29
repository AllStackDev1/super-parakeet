import { Request, Response, NextFunction } from 'express';

export type RouteHandler = [req: Request, res: Response, next: NextFunction];

export const catchAsync = (fn: (...rest: RouteHandler) => Promise<void>) => {
  const errorHandler = async (...rest: RouteHandler) => {
    try {
      await fn(...rest); // Await the function here
    } catch (err) {
      rest[2](err); // Call `next` with the error
    }
  };
  return errorHandler;
};
