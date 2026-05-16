const { Router } = require('express');
const SalaReunion = require('../models/sala_reunion');
const roomService = require('../services/roomService');
const { authorizeRoleById } = require('../middlewares/authorizeRole');

const router = Router();

router.get('/', async (req, res) => {
  try {
    const salas = await SalaReunion.findAll();
    res.json(salas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener salas', error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const sala = await SalaReunion.findByPk(id);
    if (!sala) return res.status(404).json({ message: 'Sala no encontrada' });
    res.json(sala);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener la sala', error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const sala = await SalaReunion.create(req.body);
    res.status(201).json(sala);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear la sala', error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [updatedCount] = await SalaReunion.update(req.body, { where: { id_sala: id } });
    if (!updatedCount) return res.status(404).json({ message: 'Sala no encontrada' });
    const updated = await SalaReunion.findByPk(id);
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar la sala', error: error.message });
  }
});

router.delete('/:id', authorizeRoleById([2]), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const actorId = req.usuarioAuth.id_usuario;

    const result = await roomService.deleteRoom(id, actorId);
    res.json(result);
  } catch (error) {
    console.error('Error deleteRoom:', error);
    const status = error.status || 500;
    res.status(status).json({
      message: error.message || 'Error al eliminar la sala',
      error: error.message,
    });
  }
});

module.exports = router;
