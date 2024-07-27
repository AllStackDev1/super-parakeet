import { Request, Response, NextFunction } from 'express';

const DEFUALT_MESSAGE = (req: Request) =>
  `METHOD: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}]`;

export function loggerHandler(req: Request, res: Response, next: NextFunction) {
  logger.log(`Incomming - ${DEFUALT_MESSAGE(req)}`);

  res.on('finish', () => {
    logger.log(
      `Result - ${DEFUALT_MESSAGE(req)} - STATUS: [${res.statusCode}]`,
    );
  });

  next();
}
