const reservationService = require('../services/reservationService');
const { buildReservationResponse } = require('../dtos/reservation.dto');

const handleError = (res, error) => {
  const status = error.status || 500;
  const payload = {
    msg: error.message || 'Error en el servidor',
  };
  if (error.details) {
    payload.errors = error.details;
  }
  return res.status(status).json(payload);
};

/**
 * GET /api/reservas
 * - Docente (id_rol=1): obtiene solo sus reservas
 * - Secretaria (id_rol=2): obtiene todas las reservas
 */
const getReservations = async (req, res) => {
  try {
    
    
    let reservas = reservas = await reservationService.getAllReservations();
    
    
    res.json(reservas.map(buildReservationResponse));
  } catch (error) {
    console.error('Error getReservations:', error);
    handleError(res, error);
  }
};

const getReservationById = async (req, res) => {
  try {
    const reserva = await reservationService.getReservationById(req.params.id);
    res.json(buildReservationResponse(reserva));
  } catch (error) {
    console.error('Error getReservationById:', error);
    handleError(res, error);
  }
};

const createReservation = async (req, res) => {
  try {
    const actorId = req.usuarioAuth.id_usuario;
    const payload = { ...req.body, id_usuario: Number(req.body.id_usuario) };
    const reserva = await reservationService.createReservation(payload, actorId);
    res.status(201).json({
      msg: 'Reserva creada exitosamente',
      reserva: buildReservationResponse(reserva),
    });
  } catch (error) {
    console.error('Error createReservation:', error);
    handleError(res, error);
  }
};

const updateReservation = async (req, res) => {
  try {
    const { id_usuario: actorId, id_rol: actorRole } = req.usuarioAuth;
    const reserva = await reservationService.updateReservation(req.params.id, req.body, actorId, actorRole);
    res.json({
      msg: 'Reserva actualizada correctamente',
      reserva: buildReservationResponse(reserva),
    });
  } catch (error) {
    console.error('Error updateReservation:', error);
    handleError(res, error);
  }
};

const cancelReservation = async (req, res) => {
  try {
    const { id_usuario: actorId, id_rol: actorRole } = req.usuarioAuth;
    const reserva = await reservationService.cancelReservation(req.params.id, actorId, actorRole);
    res.json({
      msg: 'Reserva cancelada correctamente',
      reserva: buildReservationResponse(reserva),
    });
  } catch (error) {
    console.error('Error cancelReservation:', error);
    handleError(res, error);
  }
};

const getTeacherHistory = async (req, res) => {
  try {
    const userId = req.params.userId;
    const reservas = await reservationService.getTeacherReservationHistory(userId);
    res.json(reservas.map(buildReservationResponse));
  } catch (error) {
    console.error('Error getTeacherHistory:', error);
    handleError(res, error);
  }
};

module.exports = {
  getReservations,
  getReservationById,
  createReservation,
  updateReservation,
  cancelReservation,
  getTeacherHistory,
};
