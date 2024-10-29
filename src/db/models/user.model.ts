import {
  Model,
  UUIDV4,
  DataTypes,
  InferAttributes,
  CreationOptional,
} from 'sequelize';
import bcrypt from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { decorate, injectable } from 'inversify';

import sequelize from 'configs/sequelize.config';
import { HASHING_SALT, jwtConfig } from 'configs/env.config';

decorate(injectable(), Model);

@injectable()
export class UserModel extends Model<UserModelDto> {
  declare email: string;
  declare lastName: string;
  declare password: string;
  declare firstName: string;
  declare id?: CreationOptional<string>;
  declare createdAt?: CreationOptional<string>;
  declare updatedAt?: CreationOptional<string>;
  declare deletedAt?: CreationOptional<string>;
  declare dateOfBirth?: CreationOptional<Date>;

  getFullname() {
    return this?.firstName + ' ' + this?.lastName;
  }

  getAge() {
    if (!this?.dateOfBirth) {
      return 0;
    }
    const birthYear = new Date(this?.dateOfBirth).getFullYear();
    const currentYear = new Date().getFullYear();
    return currentYear - birthYear;
  }

  async isPasswordMatch(password: string) {
    return await bcrypt.compare(password, this.password);
  }

  generateJWT(type: 'access' | 'refresh' | 'reset' | 'verify') {
    const { secretKey, accessExpiresIn, refreshExpiresIn, defaultExpiresIn } =
      jwtConfig;
    return sign(
      { sub: this.id, email: this.email, username: this.getFullname(), type },
      secretKey,
      {
        expiresIn:
          type === 'access'
            ? accessExpiresIn
            : type === 'refresh'
              ? refreshExpiresIn
              : defaultExpiresIn,
      },
    );
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
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      set(value: string) {
        const salt = bcrypt.genSaltSync(+HASHING_SALT);
        const hash = bcrypt.hashSync(value, salt + this.email);
        this.setDataValue('password', hash);
      },
    },
    dateOfBirth: {
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
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    paranoid: true,
    freezeTableName: true,
    modelName: 'Users',
    defaultScope: {
      attributes: { exclude: ['password'] },
    },
  },
);

export type UserModelDto = InferAttributes<UserModel>;
// s
