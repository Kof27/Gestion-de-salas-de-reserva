const { DataTypes } = require('sequelize');
const { bdmysql } = require('../lib/MySqlConnection');

const Whitelist = bdmysql.define(
    'whitelist',
    {
        correo: {
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: false,
        },
    },
    {
        tableName: 'whitelist',
        timestamps: false,
        freezeTableName: true,
    }
);

module.exports = Whitelist;