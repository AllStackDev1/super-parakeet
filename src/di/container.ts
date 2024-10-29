import { interfaces, Container as InversifyContainer } from 'inversify';
import {
  ServerModule,
  ModelsModule,
  ServicesModule,
  MiddlewareModule,
  ControllersModule,
  RepositoriesModule,
} from './modules';
import { App } from 'app';

class ContainerManager {
  private static instance: ContainerManager;
  private _container: InversifyContainer;
  private initialized: boolean = false;

  private constructor() {
    this._container = new InversifyContainer({
      defaultScope: 'Singleton',
    });
  }

  public static getInstance(): ContainerManager {
    if (!ContainerManager.instance) {
      ContainerManager.instance = new ContainerManager();
    }
    return ContainerManager.instance;
  }

  public getContainer(): InversifyContainer {
    if (!this.initialized) {
      this.initialize();
    }
    return this._container;
  }

  public get<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>): T {
    if (!this.initialized) {
      this.initialize();
    }
    return this._container.get<T>(serviceIdentifier);
  }

  private initialize() {
    if (this.initialized) return;

    this._container.load(ServerModule);
    this._container.load(MiddlewareModule);
    this._container.load(ModelsModule);
    this._container.load(RepositoriesModule);
    this._container.load(ServicesModule);
    this._container.load(ControllersModule);
    this._container.bind<App>(App).toSelf();

    this.initialized = true;
  }

  public rebind<T>(
    serviceIdentifier: interfaces.ServiceIdentifier<T>,
  ): interfaces.BindingToSyntax<T> {
    return this._container.bind<T>(serviceIdentifier);
  }
}

export const container = ContainerManager.getInstance();
