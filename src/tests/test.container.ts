import { interfaces } from 'inversify';

import { Container } from 'di/container';

export class TestContainer extends Container {
  public rebind<T>(
    serviceIdentifier: interfaces.ServiceIdentifier<T>,
  ): interfaces.BindingToSyntax<T> {
    return this.container.rebind<T>(serviceIdentifier);
  }

  public get<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>): T {
    return this.container.get<T>(serviceIdentifier);
  }
}
