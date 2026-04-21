const { DataTypes } = require('sequelize');
const { bdmysql } = require('../lib/MySqlConnection');

const Usuario = bdmysql.define('usuario',
    {
        // Model attributes are defined here
        'id_usuario': {
            type: DataTypes.INTEGER,
            //allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },


        'id_facultad': {
            type: DataTypes.INTEGER,
            allowNull: false
            // allowNull defaults to true
        },


        'id_rol': {
            type: DataTypes.INTEGER,
            allowNull: false
            // allowNull defaults to true
        },
        'nombre': {
            type: DataTypes.STRING,
            allowNull: false
            // allowNull defaults to true
        },
        'correo': {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
        isEmail: true
        }
        },
       'contrasena': {
            type: DataTypes.STRING,
            allowNull: false
            // allowNull defaults to true
        },
        'estado': {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            // allowNull defaults to true
        },
        'fecha_registro': {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },

    },


    {
        //Maintain table name don't plurilize
        freezeTableName: true,


        // I don't want createdAt
        createdAt: false,


        // I don't want updatedAt
        updatedAt: false
    }
);

// Definir asociaciones
const Rol = require('./rol');
Usuario.belongsTo(Rol, {
    foreignKey: 'id_rol',
    as: 'rol'
});

module.exports = Usuario;
