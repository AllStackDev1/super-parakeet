import {
  Express,
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from 'express';

import { catchAsync } from 'utils';
import { AuthController, UserController } from 'controllers';

type IController = AuthController | UserController;

type RouteHandler = Map<keyof Express, Map<string, RequestHandler[]>>;

export function defineRoutes(controllers: IController[], app: Express) {
  for (const controller of controllers) {
    const routeHandlers: RouteHandler = Reflect.getMetadata(
      'routeHandlers',
      controller,
    );

    const controllerPath: string = Reflect.getMetadata(
      'baseRoute',
      controller.constructor,
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
                return item.call(controller, req, res, next);
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
