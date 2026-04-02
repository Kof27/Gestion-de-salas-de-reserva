const { DataTypes } = require('sequelize');
const { bdmysql } = require('../lib/MySqlConnection');

const LogAuditoria = bdmysql.define(
  'log_auditoria',
  {
    id_log: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    accion: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    entidad: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    detalle: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    fecha_hora: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'log_auditoria',
    timestamps: false,
    freezeTableName: true,
  }
);

module.exports = LogAuditoria;
