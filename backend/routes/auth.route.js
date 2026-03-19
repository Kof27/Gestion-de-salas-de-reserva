const { Router } = require('express');
const Usuario = require('../models/usuario');

const router = Router();

// Registro de usuario
router.post('/register', async (req, res) => {
  try {
    const { nombre, correo, contrasena, id_facultad, id_rol } = req.body;
    const usuario = await Usuario.create({
      nombre,
      correo,
      contrasena,
      id_facultad,
      id_rol,
      fecha_registro: new Date(),
    });
    return res.status(201).json(usuario);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al registrar el usuario', error: error.message });
  }
});

// Login básico
router.post('/login', async (req, res) => {
  try {
    const { correo, contrasena } = req.body;
    const usuario = await Usuario.findOne({ where: { correo } });
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    if (usuario.contrasena !== contrasena) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    return res.json({ message: 'Login exitoso', usuario });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al iniciar sesión', error: error.message });
  }
});

module.exports = router;
