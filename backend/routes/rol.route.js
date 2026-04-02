const { Router } = require('express');
const Rol = require('../models/rol');

const router = Router();

router.get('/', async (req, res) => {
  try {
    const roles = await Rol.findAll();
    res.json(roles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener roles', error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const rol = await Rol.findByPk(req.params.id);
    if (!rol) return res.status(404).json({ message: 'Rol no encontrado' });
    res.json(rol);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener el rol', error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const rol = await Rol.create(req.body);
    res.status(201).json(rol);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear el rol', error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const [updatedCount] = await Rol.update(req.body, { where: { id_rol: req.params.id } });
    if (!updatedCount) return res.status(404).json({ message: 'Rol no encontrado' });
    const updated = await Rol.findByPk(req.params.id);
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar el rol', error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deletedCount = await Rol.destroy({ where: { id_rol: req.params.id } });
    if (!deletedCount) return res.status(404).json({ message: 'Rol no encontrado' });
    res.json({ message: 'Rol eliminado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar el rol', error: error.message });
  }
});

module.exports = router;
