const { DataTypes } = require('sequelize');
const { bdmysql } = require('../lib/MySqlConnection');

const RecursoTecnologico = bdmysql.define(
  'recurso_tecnologico',
  {
    id_recurso: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_sala: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);

module.exports = RecursoTecnologico;

