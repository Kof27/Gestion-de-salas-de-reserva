const { Router } = require('express');
const Facultad = require('../models/facultad');

const router = Router();

router.get('/', async (req, res) => {
  try {
    const facultades = await Facultad.findAll();
    res.json(facultades);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener facultades', error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const facultad = await Facultad.findByPk(req.params.id);
    if (!facultad) return res.status(404).json({ message: 'Facultad no encontrada' });
    res.json(facultad);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener la facultad', error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const facultad = await Facultad.create(req.body);
    res.status(201).json(facultad);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear la facultad', error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const [updatedCount] = await Facultad.update(req.body, { where: { id_facultad: req.params.id } });
    if (!updatedCount) return res.status(404).json({ message: 'Facultad no encontrada' });
    const updated = await Facultad.findByPk(req.params.id);
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar la facultad', error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deletedCount = await Facultad.destroy({ where: { id_facultad: req.params.id } });
    if (!deletedCount) return res.status(404).json({ message: 'Facultad no encontrada' });
    res.json({ message: 'Facultad eliminada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar la facultad', error: error.message });
  }
});

module.exports = router;
