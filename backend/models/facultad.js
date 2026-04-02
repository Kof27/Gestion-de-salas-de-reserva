const { DataTypes } = require('sequelize');
const { bdmysql } = require('../lib/MySqlConnection');

const Facultad = bdmysql.define(
  'facultad',
  {
    id_facultad: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    estado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: 'facultades',
    timestamps: false,
    freezeTableName: true,
  }
);

module.exports = Facultad;
