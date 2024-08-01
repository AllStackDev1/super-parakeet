import { Container as InversifyContainer } from 'inversify';

import {
  ModelsModule,
  RepositoryModule,
  ServicesModule,
  ControllersModule,
} from './modules';
import { App } from 'app';

export class Container {
  private _container = new InversifyContainer({
    defaultScope: 'Singleton',
  });

  constructor() {
    this.register();
  }

  protected get container() {
    return this._container;
  }

  public getApp() {
    return this.container.get(App);
  }

  private register() {
    this._container.load(ModelsModule);
    this._container.load(RepositoryModule);
    this._container.load(ServicesModule);
    this._container.load(ControllersModule);
    this._container.bind<App>(App).toSelf();
  }
}
