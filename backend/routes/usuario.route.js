const { Router } = require('express');
const Usuario = require('../models/usuario');
const { esSecretaria } = require('../middlewares/autorizarRol');

const router = Router();

/**
 * RUTAS DE USUARIOS - SOLO SECRETARIAS
 * 
 * Las secretarias (id_rol = 2) pueden gestionar todos los usuarios.
 * Los docentes (id_rol = 1) no tienen acceso.
 */

// GET /api/usuarios - Listar todos los usuarios
router.get('/', esSecretaria, async (req, res) => {
  try {
    const usuarios = await Usuario.findAll();
    res.json(usuarios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener usuarios', error: error.message });
  }
});

// GET /api/usuarios/:id - Obtener usuario por ID
router.get('/:id', esSecretaria, async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id);
    if (!usuario) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(usuario);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener el usuario', error: error.message });
  }
});

// POST /api/usuarios - Crear usuario
router.post('/', esSecretaria, async (req, res) => {
  try {
    const usuario = await Usuario.create(req.body);
    res.status(201).json(usuario);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear el usuario', error: error.message });
  }
});

// PUT /api/usuarios/:id - Actualizar usuario
router.put('/:id', esSecretaria, async (req, res) => {
  try {
    const [updatedCount] = await Usuario.update(req.body, {
      where: { id_usuario: req.params.id },
    });
    if (!updatedCount) return res.status(404).json({ message: 'Usuario no encontrado' });
    const updated = await Usuario.findByPk(req.params.id);
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar el usuario', error: error.message });
  }
});

// Eliminar usuario
router.delete('/:id', esSecretaria, async (req, res) => {
  try {
    const deletedCount = await Usuario.destroy({ where: { id_usuario: req.params.id } });
    if (!deletedCount) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json({ message: 'Usuario eliminado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar el usuario', error: error.message });
  }
});

module.exports = router;
