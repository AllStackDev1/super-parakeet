import { INTERNAL_SERVER_ERROR } from 'http-status';
import { TYPES } from 'di/types';
import { AppError } from 'utils';
import { container } from 'di/container';
import { RouteHandler } from 'utils/catchAsync';
import { AuthHandler } from 'middlewares/authHandler';

export function AuthGuard() {
  return function (target: object, _: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: RouteHandler) {
      if (!container) {
        throw new AppError('Container not set', INTERNAL_SERVER_ERROR);
      }
      const authHandler = container.get<AuthHandler>(TYPES.AuthHandler);
      const handlerMiddleware = await authHandler.handler();

      return new Promise((resolve, reject) => {
        handlerMiddleware(args[0], args[1], (error) => {
          if (error) {
            reject(error);
          } else {
            originalMethod.apply(this, args).then(resolve).catch(reject);
          }
        });
      });
    };
    return descriptor;
  };
}
