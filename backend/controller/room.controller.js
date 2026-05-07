const roomService = require('../services/roomService');
const { buildRoomResponse } = require('../dtos/room.dto');

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

const getRooms = async (req, res) => {
  try {
    const rooms = await roomService.getRooms();
    res.json(rooms.map(buildRoomResponse));
  } catch (error) {
    console.error('Error getRooms:', error);
    handleError(res, error);
  }
};

const getRoomById = async (req, res) => {
  try {
    const room = await roomService.getRoomById(req.params.id);
    res.json(buildRoomResponse(room));
  } catch (error) {
    console.error('Error getRoomById:', error);
    handleError(res, error);
  }
};

const createRoom = async (req, res) => {
  try {
    const actorId = req.usuarioAuth.id_usuario;
    const room = await roomService.createRoom(req.body, actorId);
    res.status(201).json({
      msg: 'Sala creada exitosamente',
      sala: buildRoomResponse(room),
    });
  } catch (error) {
    console.error('Error createRoom:', error);
    handleError(res, error);
  }
};

const updateRoom = async (req, res) => {
  try {
    const actorId = req.usuarioAuth.id_usuario;
    const room = await roomService.updateRoom(req.params.id, req.body, actorId);
    res.json({
      msg: 'Sala actualizada correctamente',
      sala: buildRoomResponse(room),
    });
  } catch (error) {
    console.error('Error updateRoom:', error);
    handleError(res, error);
  }
};

const setRoomStatus = async (req, res) => {
  try {
    const actorId = req.usuarioAuth.id_usuario;
    const { habilitada } = req.body;
    if (typeof habilitada !== 'boolean') {
      return res.status(400).json({ msg: 'El campo habilitada debe ser booleano.' });
    }
    const room = await roomService.setRoomStatus(req.params.id, habilitada, actorId);
    res.json({
      msg: habilitada ? 'Sala habilitada correctamente' : 'Sala deshabilitada correctamente',
      sala: buildRoomResponse(room),
    });
  } catch (error) {
    console.error('Error setRoomStatus:', error);
    handleError(res, error);
  }
};

module.exports = {
  getRooms,
  getRoomById,
  createRoom,
  updateRoom,
  setRoomStatus,
};
