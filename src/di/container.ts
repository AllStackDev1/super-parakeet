import { interfaces, Container as InversifyContainer } from 'inversify';
import { ServiceModule, RepositoryModule, ControllerModule } from './modules';
import { App } from 'app';

export class Container {
  private _container: InversifyContainer = new InversifyContainer({
    defaultScope: 'Singleton',
  });

  protected get container(): InversifyContainer {
    return this._container;
  }

  constructor() {
    this.register();
  }

  public getInjector<T>(id: interfaces.ServiceIdentifier<T>) {
    return this.container.get<T>(id);
  }

  private register(): void {
    this._container.load(RepositoryModule);
    this._container.load(ServiceModule);
    this._container.load(ControllerModule);

    this._container.bind<App>(App).toSelf();
  }
}

const container = new Container();
export { container };
