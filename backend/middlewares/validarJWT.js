const jwt = require('jsonwebtoken');
const { obtenerSecreto } = require('../helpers/generarJWT');

/**
 * Exige cabecera Authorization: Bearer <token> y adjunta el payload en req.usuarioAuth.
 * 
 * Payload esperado: { id_usuario, correo, id_rol, id_facultad }
 * Disponible en: req.usuarioAuth
 */
const validarJWT = (req, res, next) => {
    const authHeader = req.header('Authorization') || req.header('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ msg: 'No se proporcionó token de autenticación' });
    }

    const token = authHeader.slice(7).trim();
    if (!token) {
        return res.status(401).json({ msg: 'Token vacío' });
    }

    try {
        const decoded = jwt.verify(token, obtenerSecreto());
        req.usuarioAuth = decoded; // Mantener consistencia con el resto del código
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ msg: 'Token expirado' });
        }
        return res.status(401).json({ msg: 'Token no válido' });
    }
};

module.exports = {
    validarJWT,
};
