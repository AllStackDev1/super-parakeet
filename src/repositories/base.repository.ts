import { injectable } from 'inversify';
import {
  Model,
  Attributes,
  ModelStatic,
  WhereOptions,
  WhereAttributeHashValue,
  FindOptions,
} from 'sequelize';
import { MakeNullishOptional } from 'sequelize/lib/utils';

export type ModelType<T extends Model<T>> = ModelStatic<T>;

@injectable()
export class BaseRepository<K, T extends Model> {
  constructor(protected model: ModelType<T>) {}

  public async create(payload: MakeNullishOptional<T['_creationAttributes']>) {
    return await this.model.create(payload);
  }

  public async getAll(query: WhereOptions<Attributes<T>> = {}) {
    return await this.model.findAll({ where: query });
  }

  public async getById(
    id: string,
    options?: Omit<FindOptions<Attributes<T>>, 'where'>,
  ) {
    return await this.model.findByPk(id, options);
  }

  public async getOne(
    query: WhereOptions<Attributes<T>>,
    options?: Omit<FindOptions<Attributes<T>>, 'where'>,
  ) {
    return await this.model.findOne({ where: query, ...options });
  }

  public async updateById(id: string, payload: Partial<K>) {
    return await this.model.update(payload, {
      where: { id: id as WhereAttributeHashValue<Attributes<T>[string]> },
    });
  }

  public async deleteById(id: string, forceDel?: boolean) {
    return await this.model.destroy({
      where: { id: id as WhereAttributeHashValue<Attributes<T>[string]> },
      force: forceDel,
    });
  }
}
