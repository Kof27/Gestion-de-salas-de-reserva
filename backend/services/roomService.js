const SalaReunion = require('../models/sala_reunion');
const Facultad = require('../models/facultad');
const roomRepository = require('../repositories/roomRepository');
const auditRepository = require('../repositories/auditRepository');
const { validateCreateRoomPayload, validateUpdateRoomPayload } = require('../validation/room.validation');

const createRoom = async (payload, actorId) => {
  const errors = validateCreateRoomPayload(payload);
  if (errors.length) {
    const error = new Error('Validación de datos fallida');
    error.status = 400;
    error.details = errors;
    throw error;
  }

  const faculty = await Facultad.findByPk(payload.id_facultad);
  if (!faculty) {
    const error = new Error('Facultad no encontrada');
    error.status = 404;
    throw error;
  }

  const existingRoom = await roomRepository.findRoomByNameAndFaculty(payload.nombre, payload.id_facultad);
  if (existingRoom) {
    const error = new Error('Ya existe una sala con ese nombre en la facultad');
    error.status = 409;
    throw error;
  }

  const room = await roomRepository.createRoom({
    id_facultad: payload.id_facultad,
    nombre: payload.nombre,
    ubicacion: payload.ubicacion,
    capacidad: Number(payload.capacidad),
    descripcion: payload.descripcion || null,
    habilitada: payload.habilitada !== false,
    estado: payload.habilitada !== false ? 'activo' : 'inactivo',
    imagen_sala: payload.imagen_sala || null,
  });

  await auditRepository.createAuditLog({
    id_usuario: actorId,
    accion: 'Crear sala',
    entidad: 'Sala',
    detalle: `Sala creada: ${room.nombre} (id_sala=${room.id_sala})`,
  });

  return room;
};

const updateRoom = async (id, payload, actorId) => {
  const errors = validateUpdateRoomPayload(payload);
  if (errors.length) {
    const error = new Error('Validación de datos fallida');
    error.status = 400;
    error.details = errors;
    throw error;
  }

  const room = await roomRepository.findRoomById(id);
  if (!room) {
    const error = new Error('Sala no encontrada');
    error.status = 404;
    throw error;
  }

  if (payload.nombre && payload.nombre !== room.nombre) {
    const duplicate = await roomRepository.findRoomByNameAndFaculty(payload.nombre, room.id_facultad);
    if (duplicate && duplicate.id_sala !== room.id_sala) {
      const error = new Error('Ya existe otra sala con ese nombre en la misma facultad');
      error.status = 409;
      throw error;
    }
  }

  const updatedRoom = await roomRepository.updateRoom(id, {
    nombre: payload.nombre ?? room.nombre,
    ubicacion: payload.ubicacion ?? room.ubicacion,
    capacidad: payload.capacidad !== undefined ? Number(payload.capacidad) : room.capacidad,
  });

  await auditRepository.createAuditLog({
    id_usuario: actorId,
    accion: 'Actualizar sala',
    entidad: 'Sala',
    detalle: `Sala actualizada: ${updatedRoom.nombre} (id_sala=${updatedRoom.id_sala})`,
  });

  return updatedRoom;
};

const setRoomStatus = async (id, enabled, actorId) => {
  const room = await roomRepository.findRoomById(id);
  if (!room) {
    const error = new Error('Sala no encontrada');
    error.status = 404;
    throw error;
  }

  const status = enabled ? 'habilitada' : 'deshabilitada';
  const statusLabel = enabled ? 'activo' : 'inactivo';

  const updatedRoom = await roomRepository.updateRoomStatus(id, enabled);

  await auditRepository.createAuditLog({
    id_usuario: actorId,
    accion: enabled ? 'Habilitar sala' : 'Deshabilitar sala',
    entidad: 'Sala',
    detalle: `Sala ${status}: ${updatedRoom.nombre} (id_sala=${updatedRoom.id_sala})`,
  });

  return updatedRoom;
};

const getRooms = async () => {
  return roomRepository.findRooms();
};

const getRoomById = async (id) => {
  const room = await roomRepository.findRoomById(id);
  if (!room) {
    const error = new Error('Sala no encontrada');
    error.status = 404;
    throw error;
  }
  return room;
};

const deleteRoom = async (id, actorId) => {
  const room = await roomRepository.findRoomById(id);
  if (!room) {
    const error = new Error('Sala no encontrada');
    error.status = 404;
    throw error;
  }

  // Eliminar la sala y sus reservas asociadas (cascada)
  await roomRepository.deleteRoom(id);

  await auditRepository.createAuditLog({
    id_usuario: actorId,
    accion: 'Eliminar sala',
    entidad: 'Sala',
    detalle: `Sala eliminada: ${room.nombre} (id_sala=${room.id_sala}). Se eliminaron también todas las reservas asociadas.`,
  });

  return { message: 'Sala eliminada exitosamente junto con sus reservas' };
};

module.exports = {
  createRoom,
  updateRoom,
  setRoomStatus,
  getRooms,
  getRoomById,
  deleteRoom,
};
