const LogAuditoria = require('../models/log_auditoria');

const createAuditLog = async ({ id_usuario, accion, entidad, detalle }) => {
  return LogAuditoria.create({
    id_usuario,
    accion,
    entidad,
    detalle,
  });
};

module.exports = {
  createAuditLog,
};
