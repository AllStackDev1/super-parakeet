import {
  UUIDV4,
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize';
import sequelize from './connection';

export class UserModel extends Model<IUserModel, IUserModelDTO> {
  declare id: CreationOptional<string>;
  //declare userType: string[];
  declare firstName: string;
  declare lastName: string;
  declare email: string;
  declare password: string;
  /* static associate(models) {
      // define association here
    } */
}
UserModel.init(
  {
    // userType: dataType.ENUM,
    id: {
      type: DataTypes.UUIDV4,
      primaryKey: true,
      defaultValue: UUIDV4,
      allowNull: false,
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
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  { sequelize, modelName: 'Users' },
);

export interface IUserModel extends InferAttributes<UserModel> {}
export interface IUserModelDTO extends InferCreationAttributes<UserModel> {}
