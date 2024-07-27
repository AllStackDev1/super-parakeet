export function Controller(baseRoute: string = ''): ClassDecorator {
  return (target) => {
    Reflect.defineMetadata('baseRoute', baseRoute, target);
  };
}
