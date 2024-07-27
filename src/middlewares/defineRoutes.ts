/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Express,
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from 'express';

import { Container } from 'di/container';
import { catchAsync } from 'utils';

type RouteHandler = Map<keyof Express, Map<string, RequestHandler[]>>;

export function defineRoutes(
  controllers: any[],
  app: Express,
  container: Container,
) {
  for (const controller of controllers) {
    const Controller: any = container.getInjector(controller);

    const routeHandlers: RouteHandler = Reflect.getMetadata(
      'routeHandlers',
      Controller,
    );

    const controllerPath: string = Reflect.getMetadata(
      'baseRoute',
      Controller.constructor,
    );
    const methods = Array.from(routeHandlers.keys());

    for (let j = 0; j < methods.length; j++) {
      const method = methods[j];
      const routes = routeHandlers.get(method);

      if (routes) {
        const routeNames = Array.from(routes.keys());

        for (let k = 0; k < routeNames.length; k++) {
          const handlers = routes.get(routeNames[k])?.map((item) => {
            return catchAsync(
              (req: Request, res: Response, next: NextFunction) => {
                return item.call(Controller, req, res, next);
              },
            );
          });

          if (handlers) {
            app[method](controllerPath + routeNames[k], handlers);
            logger.log(
              'Loading route: ',
              method,
              controllerPath + routeNames[k],
            );
          }
        }
      }
    }
  }
}
