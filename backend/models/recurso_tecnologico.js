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
      allowNull: true,  // Permitir recursos sin sala asignada
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

// Definir asociaciones
RecursoTecnologico.associate = (models) => {
  RecursoTecnologico.belongsTo(models.sala_reunion, {
    foreignKey: 'id_sala',
    as: 'sala',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
};

module.exports = RecursoTecnologico;

