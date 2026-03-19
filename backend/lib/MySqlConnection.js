const { Sequelize } = require('sequelize');

const bdmysql = new Sequelize(
    'reservas_salas',
    'root',
    'root',
    {
        host: 'localhost',
        port: '3306',
        dialect: 'mysql'
    }
);



module.exports = {
    bdmysql
}