import { Express, RequestHandler } from 'express';

type RouteHandler = Map<keyof Express, Map<string, RequestHandler[]>>;

export function Route(
  method: keyof Express,
  path: string = '',
  ...middleware: RequestHandler[]
) {
  return (target: object, _: string, descriptor: PropertyDescriptor) => {
    const routePath = path;
    const routeHandlers: RouteHandler =
      Reflect.getMetadata('routeHandlers', target) || new Map();

    if (!routeHandlers.has(method)) {
      routeHandlers.set(method, new Map());
    }

    routeHandlers
      .get(method)
      ?.set(routePath, [...middleware, descriptor.value]);

    Reflect.defineMetadata('routeHandlers', routeHandlers, target);
  };
}
