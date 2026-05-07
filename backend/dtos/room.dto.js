const buildRoomResponse = (room) => {
  if (!room) return null;
  return {
    id_sala: room.id_sala,
    id_facultad: room.id_facultad,
    nombre: room.nombre,
    ubicacion: room.ubicacion,
    capacidad: room.capacidad,
    descripcion: room.descripcion,
    habilitada: room.habilitada,
    estado: room.estado,
    fecha_creacion: room.fecha_creacion,
    imagen_sala: room.imagen_sala,
  };
};

module.exports = {
  buildRoomResponse,
};
