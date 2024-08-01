import {
  UUIDV4,
  Model,
  DataTypes,
  InferAttributes,
  CreationOptional,
} from 'sequelize';
import { decorate, injectable } from 'inversify';
import sequelize from './connection';

decorate(injectable(), Model);

@injectable()
export class UserModel extends Model<UserModelDto> {
  declare email: string;
  declare lastName: string;
  declare password: string;
  declare firstName: string;
  declare userType: '0' | '1' | '2';
  declare id?: CreationOptional<string>;
  declare createdAt?: CreationOptional<string>;
  declare updatedAt?: CreationOptional<string>;
  declare deletedAt?: CreationOptional<string>;
  declare dateOfBirth?: CreationOptional<Date>;
  /* static associate(models) {
      // define association here
    } */

  getFullname() {
    return this.firstName + ' ' + this.lastName;
  }

  getAge() {
    if (!this.dateOfBirth) {
      return 0;
    }
    const birthYear = new Date(this.dateOfBirth).getFullYear();
    const currentYear = new Date().getFullYear();
    return currentYear - birthYear;
  }
}

UserModel.init(
  {
    id: {
      allowNull: false,
      primaryKey: true,
      defaultValue: UUIDV4,
      type: DataTypes.UUID,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    userType: {
      type: DataTypes.ENUM('0', '1', '2'),
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dateOfBirth: {
      allowNull: false,
      type: DataTypes.DATE,
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
    deletedAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
  },
  { sequelize, paranoid: true, freezeTableName: true, modelName: 'Users' },
);

export interface UserModelDto extends InferAttributes<UserModel> {}
