import { Sequelize } from 'sequelize';

import { dbConfig } from 'configs/env.config';

export default new Sequelize(dbConfig);
