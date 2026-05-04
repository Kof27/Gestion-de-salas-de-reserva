const Usuario = require('../models/usuario');
const SalaReunion = require('../models/sala_reunion');
const reservationRepository = require('../repositories/reservationRepository');
const auditRepository = require('../repositories/auditRepository');
const { validateCreateReservationPayload, parseTimeValue } = require('../validation/reservation.validation');

const createReservation = async (payload, actorId) => {
  const errors = validateCreateReservationPayload(payload);
  if (errors.length) {
    const error = new Error('Validación de datos fallida');
    error.status = 400;
    error.details = errors;
    throw error;
  }

  const hora_inicio = parseTimeValue(payload.hora_inicio);
  const hora_fin = parseTimeValue(payload.hora_fin);

  const user = await Usuario.findByPk(payload.id_usuario);
  if (!user) {
    const error = new Error('Usuario no encontrado');
    error.status = 404;
    throw error;
  }

  const sala = await SalaReunion.findByPk(payload.id_sala);
  if (!sala) {
    const error = new Error('Sala no encontrada');
    error.status = 404;
    throw error;
  }

  if (!sala.habilitada) {
    const error = new Error('La sala está deshabilitada y no puede reservarse');
    error.status = 409;
    throw error;
  }

  if (payload.id_usuario !== actorId) {
    const error = new Error('Solo el usuario autenticado puede crear su propia reserva');
    error.status = 403;
    throw error;
  }

  const overlap = await reservationRepository.findActiveOverlap(
    payload.id_sala,
    payload.fecha,
    hora_inicio,
    hora_fin
  );

  if (overlap) {
    const error = new Error('Ya existe una reserva solapada para esa sala en ese horario');
    error.status = 409;
    throw error;
  }

  const reservation = await reservationRepository.createReservation({
    id_sala: payload.id_sala,
    id_usuario: payload.id_usuario,
    fecha: payload.fecha,
    hora_inicio,
    hora_fin,
    motivo: payload.motivo,
    estado: true,
  });

  await auditRepository.createAuditLog({
    id_usuario: actorId,
    accion: 'Crear reserva',
    entidad: 'Reserva',
    detalle: `Reserva creada: id_sala=${reservation.id_sala}, fecha=${reservation.fecha}, hora_inicio=${reservation.hora_inicio}, hora_fin=${reservation.hora_fin}`,
  });

  return reservation;
};

const getAllReservations = async () => {
  return reservationRepository.findReservations();
};

const getReservationById = async (id) => {
  const reservation = await reservationRepository.findReservationById(id);
  if (!reservation) {
    const error = new Error('Reserva no encontrada');
    error.status = 404;
    throw error;
  }
  return reservation;
};

const updateReservation = async (id, payload, actorId) => {
  const reservation = await reservationRepository.findReservationById(id);
  if (!reservation) {
    const error = new Error('Reserva no encontrada');
    error.status = 404;
    throw error;
  }

  if (reservation.id_usuario !== actorId) {
    const error = new Error('Solo el creador de la reserva puede modificarla');
    error.status = 403;
    throw error;
  }

  const updatedReservation = await reservationRepository.updateReservation(id, payload);
  await auditRepository.createAuditLog({
    id_usuario: actorId,
    accion: 'Actualizar reserva',
    entidad: 'Reserva',
    detalle: `Reserva actualizada: id_reserva=${id}`,
  });

  return updatedReservation;
};

const cancelReservation = async (id, actorId) => {
  const reservation = await reservationRepository.findReservationById(id);
  if (!reservation) {
    const error = new Error('Reserva no encontrada');
    error.status = 404;
    throw error;
  }

  if (reservation.id_usuario !== actorId) {
    const error = new Error('Solo el creador de la reserva puede cancelarla');
    error.status = 403;
    throw error;
  }

  const canceledReservation = await reservationRepository.cancelReservation(id);
  await auditRepository.createAuditLog({
    id_usuario: actorId,
    accion: 'Cancelar reserva',
    entidad: 'Reserva',
    detalle: `Reserva cancelada: id_reserva=${id}`,
  });

  return canceledReservation;
};

module.exports = {
  createReservation,
  getAllReservations,
  getReservationById,
  updateReservation,
  cancelReservation,
};
