const { DataTypes } = require('sequelize');
const { bdmysql } = require('../lib/MySqlConnection');

const Reserva = bdmysql.define(
  'reserva',
  {
    id_reserva: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_sala: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    fecha: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    hora_inicio: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    hora_fin: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    motivo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    estado: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    fecha_creacion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    freezeTableName: true,
    timestamps: false,
  }
);

// Definir asociaciones
Reserva.associate = (models) => {
  Reserva.belongsTo(models.sala_reunion, {
    foreignKey: 'id_sala',
    as: 'sala',
  });
  Reserva.belongsTo(models.usuario, {
    foreignKey: 'id_usuario',
    as: 'usuario',
  });
};

module.exports = Reserva;
