/**
 * Valida presencia y formato básico de correo y contraseña en el login.
 */
const validarCamposLogin = (req, res, next) => {
    const { correo, contrasena } = req.body || {};

    if (correo === undefined || correo === null || contrasena === undefined || contrasena === null) {
        return res.status(400).json({ msg: 'Correo y contraseña son obligatorios' });
    }

    if (typeof correo !== 'string' || typeof contrasena !== 'string') {
        return res.status(400).json({ msg: 'Correo y contraseña deben ser texto' });
    }

    const correoTrim = correo.trim();
    if (!correoTrim || !contrasena.length) {
        return res.status(400).json({ msg: 'Correo y contraseña no pueden estar vacíos' });
    }

    const emailBasico = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailBasico.test(correoTrim)) {
        return res.status(400).json({ msg: 'El correo no tiene un formato válido' });
    }

    req.body.correo = correoTrim;
    next();
};

module.exports = {
    validarCamposLogin,
};
