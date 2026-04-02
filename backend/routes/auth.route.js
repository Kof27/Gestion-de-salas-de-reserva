const { Router } = require('express');
const { login, register } = require('../controller/auth.controller');
const router = Router();

// 🔐 Login
router.post('/login', login);

// 📝 Registro
router.post('/register', register);

module.exports = router;
