const { Router } = require('express');
const { crearSala, listarSalas, obtenerSala, actualizarSala, eliminarSala } = require('../controller/sala-controller');

const router = Router();

// Obtener todas las salas de la facultad del usuario
router.get('/', listarSalas);

// Obtener una sala específica
router.get('/:id', obtenerSala);

// Crear una nueva sala (solo secretaria)
router.post('/', crearSala);

// Actualizar una sala (solo secretaria)
router.put('/:id', actualizarSala);

// Eliminar una sala (solo secretaria)
router.delete('/:id', eliminarSala);

module.exports = router;
