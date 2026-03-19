const { Router } = require('express');
const LogAuditoria = require('../models/log_auditoria');

const router = Router();

router.get('/', async (req, res) => {
  try {
    const logs = await LogAuditoria.findAll();
    res.json(logs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener los logs', error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const log = await LogAuditoria.findByPk(req.params.id);
    if (!log) return res.status(404).json({ message: 'Log no encontrado' });
    res.json(log);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener el log', error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const log = await LogAuditoria.create(req.body);
    res.status(201).json(log);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear el log', error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const [updatedCount] = await LogAuditoria.update(req.body, { where: { id_log: req.params.id } });
    if (!updatedCount) return res.status(404).json({ message: 'Log no encontrado' });
    const updated = await LogAuditoria.findByPk(req.params.id);
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar el log', error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deletedCount = await LogAuditoria.destroy({ where: { id_log: req.params.id } });
    if (!deletedCount) return res.status(404).json({ message: 'Log no encontrado' });
    res.json({ message: 'Log eliminado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar el log', error: error.message });
  }
});

module.exports = router;
