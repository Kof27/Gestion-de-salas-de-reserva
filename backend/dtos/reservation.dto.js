const buildReservationResponse = (reserva) => {
  if (!reserva) return null;
  return {
    id_reserva: reserva.id_reserva,
    id_sala: reserva.id_sala,
    id_usuario: reserva.id_usuario,
    fecha: reserva.fecha,
    hora_inicio: reserva.hora_inicio,
    hora_fin: reserva.hora_fin,
    motivo: reserva.motivo,
    estado: reserva.estado,
    fecha_creacion: reserva.fecha_creacion,
  };
};

module.exports = {
  buildReservationResponse,
};
