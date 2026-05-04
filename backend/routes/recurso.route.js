const { Router } = require('express');
const RecursoTecnologico = require('../models/recurso_tecnologico');

const router = Router();

router.get('/', async (req, res) => {
  try {
    const recursos = await RecursoTecnologico.findAll();
    res.json(recursos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener recursos', error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const recurso = await RecursoTecnologico.findByPk(req.params.id);
    if (!recurso) return res.status(404).json({ message: 'Recurso no encontrado' });
    res.json(recurso);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener el recurso', error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const recurso = await RecursoTecnologico.create(req.body);
    res.status(201).json(recurso);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear el recurso', error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const [updatedCount] = await RecursoTecnologico.update(req.body, { where: { id_recurso: req.params.id } });
    if (!updatedCount) return res.status(404).json({ message: 'Recurso no encontrado' });
    const updated = await RecursoTecnologico.findByPk(req.params.id);
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar el recurso', error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deletedCount = await RecursoTecnologico.destroy({ where: { id_recurso: req.params.id } });
    if (!deletedCount) return res.status(404).json({ message: 'Recurso no encontrado' });
    res.json({ message: 'Recurso eliminado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar el recurso', error: error.message });
  }
});

module.exports = router;
