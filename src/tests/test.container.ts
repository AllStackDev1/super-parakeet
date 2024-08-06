import { interfaces } from 'inversify';
import EventEmitter from 'node:events';

import { Container } from 'di/container';

Object.getPrototypeOf(EventEmitter.prototype).constructor = Object;

export class TestContainer extends Container {
  public rebind<T>(
    serviceIdentifier: interfaces.ServiceIdentifier<T>,
  ): interfaces.BindingToSyntax<T> {
    return this._container.bind<T>(serviceIdentifier);
  }

  public get<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>): T {
    return this._container.get<T>(serviceIdentifier);
  }
}
