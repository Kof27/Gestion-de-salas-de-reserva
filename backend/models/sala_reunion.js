const { DataTypes } = require('sequelize');
const { bdmysql } = require('../lib/MySqlConnection');

const SalaReunion = bdmysql.define(
  'sala_reunion',
  {
    id_sala: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    id_facultad: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    nombre: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    capacidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    ubicacion: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    estado: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'activo',
    },
    fecha_creacion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    imagen_sala: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
    underscored: true,
  }
);

// Definir asociaciones
SalaReunion.associate = (models) => {
  SalaReunion.hasMany(models.reserva, {
    foreignKey: 'id_sala',
    as: 'reservas',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  });
};

module.exports = SalaReunion;
