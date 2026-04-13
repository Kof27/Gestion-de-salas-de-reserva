const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { Sequelize } = require('sequelize');

const database = process.env.DB_NAME || 'reservas_salas';
const username = process.env.DB_USER || 'root';
const password = process.env.DB_PASSWORD ?? 'root';
const host = process.env.DB_HOST || 'localhost';
const port = process.env.DB_PORT || '3306';

const useSsl = process.env.DB_SSL !== 'false';
console.log('HOST BD:', process.env.DB_HOST);
console.log('PORT BD:', process.env.DB_PORT);
console.log('DB NAME:', process.env.DB_NAME);
const dialectOptions = useSsl
    ? {
          ssl: {
              require: true,
              // Aiven / muchos proveedores cloud: sin CA explícita suele fallar con rejectUnauthorized true
              rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED === 'true',
          },
      }
    : {};

const bdmysql = new Sequelize(database, username, password, {
    host,
    port,
    dialect: 'mysql',
    logging: process.env.DB_LOGGING === 'true' ? console.log : false,
    dialectOptions,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
    },
    
});

module.exports = {
    bdmysql,
};
