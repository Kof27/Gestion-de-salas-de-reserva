const { DataTypes } = require('sequelize');
const { bdmysql } = require('../lib/MySqlConnection');

const Rol = bdmysql.define(
  'rol',
  {
    id_rol: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);

module.exports = Rol;
