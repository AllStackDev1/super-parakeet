import { Model } from 'sequelize';
import EventEmitter from 'node:events';
import { injectable } from 'inversify';

import { IRepository } from 'repositories';

@injectable()
export class BaseService<T extends IRepository<Model>>
  extends EventEmitter
  implements IService<T>
{
  constructor(protected repo: IRepository<Model>) {
    super();
  }

  public async create(payload: Partial<T>) {
    return await this.repo.create(payload);
  }
}

export interface IService<T> {
  create(payload: Partial<T>): Promise<Model<Partial<T>>>;
}

//   T extends Model<any, any> | Hooks<Model<any, any>, any, any>,
// > {
//   create(payload: MakeNullishOptional<T['_creationAttributes']>): Promise<T>;
//   getAll(): Promise<T[]>;
//   getById(id: string): Promise<T | null>;
//   getOne(query: WhereOptions<Attributes<T>>): Promise<T | null>;
//   query(query: WhereOptions<Attributes<T>>): Promise<T[]>;
//   update(id: any, payload: any): Promise<[affectedCount: number]>;
//   delete(id: any): Promise<number>;
// }
