const { Op } = require('sequelize');
const Reserva = require('../models/reserva');
const SalaReunion = require('../models/sala_reunion');
const findReservationById = async (id) => {
  return Reserva.findByPk(id, {
    include: [
      { association: 'sala', attributes: ['id_sala', 'nombre', 'ubicacion', 'capacidad'] },
      { association: 'usuario', attributes: ['id_usuario', 'nombre', 'correo'] },
    ],
  });
};

const findActiveOverlap = async (id_sala, fecha, hora_inicio, hora_fin) => {
  return Reserva.findOne({
    where: {
      id_sala,
      fecha,
      estado: true,
      [Op.and]: [
        { hora_inicio: { [Op.lt]: hora_fin } },
        { hora_fin: { [Op.gt]: hora_inicio } },
      ],
    },
  });
};

const findActiveOverlapExcludingReservation = async (
  id_reserva,
  id_sala,
  fecha,
  hora_inicio,
  hora_fin
) => {
  return Reserva.findOne({
    where: {
      id_reserva: {
        [Op.ne]: id_reserva,
      },
      id_sala,
      fecha,
      estado: true,
      [Op.and]: [
        { hora_inicio: { [Op.lt]: hora_fin } },
        { hora_fin: { [Op.gt]: hora_inicio } },
      ],
    },
  });
};

const createReservation = async (payload) => {

  // 🔍 Verificar que la sala exista y esté habilitada
  const sala = await SalaReunion.findOne({
    where: {
      id_sala: payload.id_sala,
      estado: 'activo',
    },
  });

  if (!sala) {
    const error = new Error(
      'La sala no existe o se encuentra deshabilitada'
    );
    error.status = 400;
    throw error;
  }

  // ✅ Crear reserva
  return Reserva.create(payload);
};

const updateReservation = async (id, payload) => {
  await Reserva.update(payload, {
    where: { id_reserva: id },
  });

  return findReservationById(id);
};

const cancelReservation = async (id) => {
  await Reserva.update(
    { estado: false },
    { where: { id_reserva: id } }
  );

  return findReservationById(id);
};

const findReservations = async () => {
  return Reserva.findAll({
    include: [
      { association: 'sala', attributes: ['id_sala', 'nombre', 'ubicacion', 'capacidad'] },
      { association: 'usuario', attributes: ['id_usuario', 'nombre', 'correo'] },
    ],
    order: [
      ['fecha', 'DESC'],
      ['hora_inicio', 'DESC'],
    ],
  });
};

const findReservationsByUserId = async (id_usuario) => {
  return Reserva.findAll({
    where: { id_usuario },
    include: [
      { association: 'sala', attributes: ['id_sala', 'nombre', 'ubicacion', 'capacidad'] },
      { association: 'usuario', attributes: ['id_usuario', 'nombre', 'correo'] },
    ],
    order: [
      ['fecha', 'DESC'],
      ['hora_inicio', 'DESC'],
    ],
  });
};

module.exports = {
  findReservationById,
  findActiveOverlap,
  findActiveOverlapExcludingReservation,
  createReservation,
  updateReservation,
  cancelReservation,
  findReservations,
  findReservationsByUserId,
};