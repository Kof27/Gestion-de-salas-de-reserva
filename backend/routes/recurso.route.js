const { Router } = require('express');
const RecursoTecnologico = require('../models/recurso_tecnologico');
const SalaReunion = require('../models/sala_reunion');
const { esSecretaria } = require('../middlewares/autorizarRol');

const router = Router();

/**
 * RUTAS DE RECURSOS TECNOLÓGICOS - SOLO SECRETARIAS
 * 
 * Las secretarias (id_rol = 2) pueden gestionar todos los recursos.
 * Los docentes (id_rol = 1) no tienen acceso a gestión, pero pueden consultar.
 */

// Validar que id_sala existe si se proporciona
const validateIdSala = async (id_sala) => {
  if (id_sala === null || id_sala === undefined || id_sala === 0) {
    return true; // Permitir null o 0 (sin sala asignada)
  }
  const sala = await SalaReunion.findByPk(id_sala);
  return !!sala;
};

// GET /api/recursos - Listar recursos
router.get('/', async (req, res) => {
  try {
    const recursos = await RecursoTecnologico.findAll();
    res.json(recursos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener recursos', error: error.message });
  }
});

// GET /api/recursos/:id - Obtener recurso por ID
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

// POST /api/recursos - Crear recurso (SOLO SECRETARIA)
router.post('/', esSecretaria, async (req, res) => {
  try {
    // Validar id_sala si se proporciona
    if (req.body.id_sala) {
      const salaExists = await validateIdSala(req.body.id_sala);
      if (!salaExists) {
        return res.status(400).json({ message: 'La sala especificada no existe' });
      }
    }

    const recurso = await RecursoTecnologico.create(req.body);
    res.status(201).json(recurso);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear el recurso', error: error.message });
  }
});

// PUT /api/recursos/:id - Actualizar recurso (SOLO SECRETARIA)
router.put('/:id', esSecretaria, async (req, res) => {
  try {
    // Validar id_sala si se proporciona
    if (req.body.id_sala !== undefined) {
      const salaExists = await validateIdSala(req.body.id_sala);
      if (!salaExists) {
        return res.status(400).json({ message: 'La sala especificada no existe' });
      }
      // Si se intenta poner id_sala=0, convertir a null
      if (req.body.id_sala === 0) {
        req.body.id_sala = null;
      }
    }

    const [updatedCount] = await RecursoTecnologico.update(req.body, { where: { id_recurso: req.params.id } });
    if (!updatedCount) return res.status(404).json({ message: 'Recurso no encontrado' });
    const updated = await RecursoTecnologico.findByPk(req.params.id);
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar el recurso', error: error.message });
  }
});

// DELETE /api/recursos/:id - Eliminar recurso (SOLO SECRETARIA)
router.delete('/:id', esSecretaria, async (req, res) => {
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
