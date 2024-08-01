import EventEmitter from 'node:events';
import { decorate, injectable } from 'inversify';

decorate(injectable(), EventEmitter);
@injectable()
export class BaseService extends EventEmitter {
  constructor() {
    super();
  }
}
