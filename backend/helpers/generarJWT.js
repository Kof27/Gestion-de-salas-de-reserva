const jwt = require('jsonwebtoken');

/**
 * Secreto para firmar y verificar tokens. En producción define JWT_SECRET en el entorno.
 */
function obtenerSecreto() {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        console.warn('[JWT] JWT_SECRET no está definida; usando clave solo para desarrollo.');
        return 'dev_jwt_secret_gestion_salas';
    }
    return secret;
}

/**
 * Genera un JWT con el payload indicado (no incluir contraseñas ni datos sensibles).
 * @param {object} payload - Por ejemplo { id_usuario, correo, id_rol }
 * @returns {string}
 */
function generarJWT(payload) {
    const expiresIn = process.env.JWT_EXPIRES_IN || '8h';
    return jwt.sign(payload, obtenerSecreto(), { expiresIn });
}

module.exports = {
    generarJWT,
    obtenerSecreto,
};
