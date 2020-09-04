const fs = require('fs');

require('dotenv').config();

const dbCert = process.env.dbCertPath ? fs.readFileSync(process.env.dbCertPath) : '';

module.exports = {
  dev: {
    username: 'postgres',
    password: null,
    database: 'searchneu_dev',
    host: '127.0.0.1',
    dialect: 'postgres',
  },
  test: {
    username: 'postgres',
    password: null,
    database: 'searchneu_test',
    host: '127.0.0.1',
    dialect: 'postgres',
    logging: false,
  },
  prod: {
    url: process.env.DATABASE_URL,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        rejectUnauthorized: true,
        ca: dbCert,
      },
    },
  },
};
