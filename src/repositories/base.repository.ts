/* eslint-disable @typescript-eslint/no-explicit-any */
import { injectable } from 'inversify';
import {
  Model,
  Attributes,
  ModelStatic,
  WhereOptions,
  WhereAttributeHashValue,
} from 'sequelize';
import { MakeNullishOptional } from 'sequelize/lib/utils';

export type ModelType<T extends Model<T>> = ModelStatic<T>;

@injectable()
export class BaseRepository<T extends Model> implements IRepository<T> {
  constructor(protected model: ModelType<T>) {}

  public async create(payload: MakeNullishOptional<T['_creationAttributes']>) {
    return await this.model.create(payload);
  }

  public async getAll() {
    return await this.model.findAll();
  }

  public async getById(id: string) {
    return await this.model.findByPk(id);
  }

  public async getOne(query: WhereOptions<Attributes<T>>) {
    return await this.model.findOne({ where: query });
  }

  public async query(query: WhereOptions<Attributes<T>>) {
    return await this.model.findAll({ where: query });
  }

  public async update(
    id: WhereAttributeHashValue<Attributes<T>[string]>,
    payload: MakeNullishOptional<T['_creationAttributes']>,
  ) {
    return await this.model.update(payload, { where: { id: id } });
  }

  public async delete(id: WhereAttributeHashValue<Attributes<T>[string]>) {
    return await this.model.destroy({ where: { id } });
  }
}

export interface IRepository<T extends Model<any, any>> {
  create(payload: MakeNullishOptional<T['_creationAttributes']>): Promise<T>;
  getAll(): Promise<T[]>;
  getById(id: string): Promise<T | null>;
  getOne(query: WhereOptions<Attributes<T>>): Promise<T | null>;
  query(query: WhereOptions<Attributes<T>>): Promise<T[]>;
  update(id: any, payload: any): Promise<[affectedCount: number]>;
  delete(id: any): Promise<number>;
}
