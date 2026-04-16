const fs = require('fs');
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

let ca;
if (process.env.DB_SSL_CA_PATH) {
    try {
        ca = fs.readFileSync(path.join(__dirname, '..', process.env.DB_SSL_CA_PATH), 'utf8');
    } catch (error) {
        console.error('❌ No se pudo leer el certificado CA en DB_SSL_CA_PATH:', error);
    }
}

const dialectOptions = useSsl
    ? {
          ssl: {
              require: true,
              rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED === 'true',
              ...(ca ? { ca } : {}),
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
