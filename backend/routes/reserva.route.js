const { Router } = require('express');
const Reserva = require('../models/reserva');

const router = Router();

router.get('/', async (req, res) => {
  try {
    const reservas = await Reserva.findAll();
    res.json(reservas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener reservas', error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const reserva = await Reserva.findByPk(req.params.id);
    if (!reserva) return res.status(404).json({ message: 'Reserva no encontrada' });
    res.json(reserva);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener la reserva', error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const reserva = await Reserva.create(req.body);
    res.status(201).json(reserva);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear la reserva', error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const [updatedCount] = await Reserva.update(req.body, { where: { id_reserva: req.params.id } });
    if (!updatedCount) return res.status(404).json({ message: 'Reserva no encontrada' });
    const updated = await Reserva.findByPk(req.params.id);
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar la reserva', error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deletedCount = await Reserva.destroy({ where: { id_reserva: req.params.id } });
    if (!deletedCount) return res.status(404).json({ message: 'Reserva no encontrada' });
    res.json({ message: 'Reserva eliminada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar la reserva', error: error.message });
  }
});

module.exports = router;
