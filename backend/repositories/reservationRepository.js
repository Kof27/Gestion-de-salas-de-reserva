const { Op } = require('sequelize');
const Reserva = require('../models/reserva');

const findReservationById = async (id) => {
  return Reserva.findByPk(id);
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

const createReservation = async (payload) => {
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
  return Reserva.findAll();
};

module.exports = {
  findReservationById,
  findActiveOverlap,
  createReservation,
  updateReservation,
  cancelReservation,
  findReservations,
};
