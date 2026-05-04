const { Router } = require('express');
const { login, register, changePassword } = require('../controller/auth.controller');
const { validarCamposLogin } = require('../middlewares/validarLoginCampos');
const { validarJWT } = require('../middlewares/validarJWT');
const router = Router();

// Evita "404" en clientes que envían GET por defecto (p. ej. Thunder al probar la URL)
router.get('/login', (req, res) => {
    res.status(405).json({
        msg: 'El login debe usarse con método POST y cuerpo JSON (correo, contrasena).',
        methodRecibido: 'GET',
        usar: { method: 'POST', url: '/api/auth/login', body: { correo: '...', contrasena: '...' } },
    });
});

// 🔐 Login
router.post('/login', validarCamposLogin, login);

// 📝 Registro
router.post('/register', register);

// 🔑 Cambio de contraseña
router.put('/change-password', validarJWT, changePassword);

module.exports = router;
