import { Container as InversifyContainer } from 'inversify';

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

  public getApp() {
    return this._container.get(App);
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
