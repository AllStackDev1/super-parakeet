import { Request, Response, NextFunction } from 'express';

export function corsHandler(req: Request, res: Response, next: NextFunction) {
  res.header('Access-Control-Allow-Origin', req.header('origin'));
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization',
  );
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, PATCH, DELETE');

  if (req.method === 'OPTIONS') {
    res.sendStatus(200); // Send OK for preflight
  } else {
    next();
  }
}
