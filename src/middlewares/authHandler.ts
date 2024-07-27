import { Request, Response, NextFunction } from 'express';

export function authHandler(req: Request, res: Response, next: NextFunction) {
  next();
}
