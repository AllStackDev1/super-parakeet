import { interfaces, Container as InversifyContainer } from 'inversify';

import {
  ModelsModule,
  ServicesModule,
  ThirdpartyModule,
  ControllersModule,
  RepositoriesModule,
} from './modules';
import { App } from 'app';

export class Container {
  public _container = new InversifyContainer({
    defaultScope: 'Singleton',
  });

  constructor() {
    this.register();
  }

  public get<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>): T {
    return this._container.get<T>(serviceIdentifier);
  }

  private register() {
    this._container.load(ThirdpartyModule);
    this._container.load(ModelsModule);
    this._container.load(RepositoriesModule);
    this._container.load(ServicesModule);
    this._container.load(ControllersModule);
    this._container.bind<App>(App).toSelf();
  }
}

const container = new Container();

export default container;
