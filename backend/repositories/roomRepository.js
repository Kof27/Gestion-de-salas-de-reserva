const { Op } = require('sequelize');
const SalaReunion = require('../models/sala_reunion');

const findRoomById = async (id) => {
  return SalaReunion.findByPk(id);
};

const findRoomByNameAndFaculty = async (nombre, id_facultad) => {
  return SalaReunion.findOne({
    where: {
      nombre,
      id_facultad,
    },
  });
};

const createRoom = async (payload) => {
  return SalaReunion.create(payload);
};

const updateRoom = async (id, payload) => {
  await SalaReunion.update(payload, {
    where: { id_sala: id },
  });
  return findRoomById(id);
};

const updateRoomStatus = async (id, enabled) => {
  await SalaReunion.update(
    {
      habilitada: enabled,
      estado: enabled ? 'activo' : 'inactivo',
    },
    {
      where: { id_sala: id },
    }
  );
  return findRoomById(id);
};

const findRooms = async () => {
  return SalaReunion.findAll();
};

module.exports = {
  findRoomById,
  findRoomByNameAndFaculty,
  createRoom,
  updateRoom,
  updateRoomStatus,
  findRooms,
};
