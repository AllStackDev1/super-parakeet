import { Sequelize } from 'sequelize';
import { dbConfig } from 'configs/env.config';

const sequelize = new Sequelize(dbConfig);

export default sequelize;
