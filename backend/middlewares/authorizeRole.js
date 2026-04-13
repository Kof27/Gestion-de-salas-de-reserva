const Rol = require('../models/rol');

const ROLE_ALIASES = {
  Secretary: ['secretary', 'secretaria', 'secretario', 'secretary-role'],
};

const normalizeRole = (roleName) => {
  if (typeof roleName !== 'string') return '';
  return roleName.trim().toLowerCase();
};

const authorizeRole = (roleKey) => {
  return async (req, res, next) => {
    try {
      const userPayload = req.usuarioAuth;
      if (!userPayload || !userPayload.id_rol) {
        return res.status(401).json({ msg: 'No autorizado. Token inválido.' });
      }

      const role = await Rol.findByPk(userPayload.id_rol);
      if (!role) {
        return res.status(403).json({ msg: 'Rol de usuario no encontrado.' });
      }

      const acceptedAliases = ROLE_ALIASES[roleKey] || [];
      const roleName = normalizeRole(role.nombre);
      const isAllowed = acceptedAliases.includes(roleName);

      if (!isAllowed) {
        return res.status(403).json({ msg: 'Acceso denegado. Solo secretarias pueden realizar esta acción.' });
      }

      next();
    } catch (error) {
      console.error('Error en authorizeRole:', error);
      return res.status(500).json({ msg: 'Error en el middleware de autorización.' });
    }
  };
};

module.exports = {
  authorizeRole,
};
