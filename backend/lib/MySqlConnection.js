const path = require('path');

// Intentar cargar .env desde múltiples ubicaciones
require('dotenv').config({ path: path.join(__dirname, '../.env') }); // /backend/.env
require('dotenv').config({ path: path.join(__dirname, '../../.env') }); // Raíz del proyecto

const { Sequelize } = require('sequelize');

const database = process.env.DB_NAME || 'reservas_salas';
const username = process.env.DB_USER || 'root';
const password = process.env.DB_PASSWORD ?? 'root';
const host = process.env.DB_HOST || 'localhost';
const port = process.env.DB_PORT || '3306';

const useSsl = process.env.DB_SSL !== 'false';

// Logging mejorado
console.log('═══════════════════════════════════════════════════');
console.log('📊 CONFIGURACIÓN DE BASE DE DATOS');
console.log('═══════════════════════════════════════════════════');
console.log('HOST BD:', host);
console.log('PORT BD:', port);
console.log('DB NAME:', database);
console.log('DB USER:', username);
console.log('SSL ENABLED:', useSsl);
console.log('═══════════════════════════════════════════════════');

const dialectOptions = useSsl
    ? {
          ssl: {
              require: true,
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
