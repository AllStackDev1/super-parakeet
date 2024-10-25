import 'reflect-metadata';
import { interfaces } from 'inversify';
import { container } from 'di/container';

export class TestContext {
  public mock<T>(
    implementation: () => Partial<T>,
    serviceIdentifier: interfaces.ServiceIdentifier<T>,
  ): T {
    const mock = this.mockClass<T>(implementation);
    container.rebind<T>(serviceIdentifier).toConstantValue(mock);
    return mock;
  }

  private mockClass<T>(implementation: () => Partial<T>): T {
    return jest.fn(implementation)() as T;
  }
}
