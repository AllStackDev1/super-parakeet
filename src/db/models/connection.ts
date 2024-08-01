import { Sequelize } from 'sequelize';
import { dbConfig } from 'configs/env';

const sequelize = new Sequelize(dbConfig);

export default sequelize;
