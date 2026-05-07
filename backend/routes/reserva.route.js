const { Router } = require('express');
const {
  getReservations,
  getReservationById,
  createReservation,
  updateReservation,
  cancelReservation,
  getTeacherHistory,
} = require('../controllers/reservation.controller');
const { esUnoDe } = require('../middlewares/autorizarRol');

const router = Router();

/**
 * RUTAS DE RESERVAS CON CONTROL DE ACCESO POR ROLES
 * 
 * ROLES:
 * - Docente (id_rol = 1): ve solo sus reservas
 * - Secretaria (id_rol = 2): ve todas las reservas
 */

// GET /api/reservas
// Docentes: sus propias reservas
// Secretarias: todas las reservas
router.get('/', getReservations);

// GET /api/reservas/historial/:userId
// Obtener historial de un docente específico (puede ser público)
router.get('/historial/:userId', getTeacherHistory);

// GET /api/reservas/:id
// Obtener una reserva específica por ID
router.get('/:id', getReservationById);

// POST /api/reservas
// Crear reserva (docentes y secretarias)
router.post('/', esUnoDe([1, 2]), createReservation);

// PUT /api/reservas/:id
// Actualizar reserva (docentes solo las suyas, secretarias las de todos)
router.put('/:id', esUnoDe([1, 2]), updateReservation);

// DELETE /api/reservas/:id
// Cancelar reserva (docentes solo las suyas, secretarias las de todos)
router.delete('/:id', esUnoDe([1, 2]), cancelReservation);

module.exports = router;
