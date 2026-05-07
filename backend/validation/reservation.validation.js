const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/;
const MIN_TIME = '07:00';
const MAX_TIME = '21:30';

const parseTimeValue = (value) => {
  if (typeof value !== 'string') return null;
  const normalized = value.trim();
  if (!TIME_REGEX.test(normalized)) return null;
  return normalized.length === 5 ? `${normalized}:00` : normalized;
};

const isBetweenBusinessHours = (time) => {
  if (!time) return false;
  const normalized = time.slice(0, 5);
  return normalized >= MIN_TIME && normalized <= MAX_TIME;
};

const validateCreateReservationPayload = (payload) => {
  const errors = [];

  if (!payload || typeof payload !== 'object') {
    errors.push('Payload inválido.');
    return errors;
  }

  if (!payload.fecha || typeof payload.fecha !== 'string' || payload.fecha.trim() === '') {
    errors.push('La fecha es obligatoria.');
  }

  const horaInicio = parseTimeValue(payload.hora_inicio);
  const horaFin = parseTimeValue(payload.hora_fin);

  if (!horaInicio) {
    errors.push('El formato de hora_inicio es inválido. Use HH:mm o HH:mm:ss.');
  }

  if (!horaFin) {
    errors.push('El formato de hora_fin es inválido. Use HH:mm o HH:mm:ss.');
  }

  if (horaInicio && horaFin && horaInicio >= horaFin) {
    errors.push('hora_inicio debe ser anterior a hora_fin.');
  }

  if (horaInicio && !isBetweenBusinessHours(horaInicio)) {
    errors.push('hora_inicio debe estar entre 07:00 y 21:30.');
  }

  if (horaFin && !isBetweenBusinessHours(horaFin)) {
    errors.push('hora_fin debe estar entre 07:00 y 21:30.');
  }

  if (payload.id_sala == null || Number.isNaN(Number(payload.id_sala)) || Number(payload.id_sala) <= 0) {
    errors.push('El id_sala es obligatorio y debe ser un número válido.');
  }

  if (payload.id_usuario == null || Number.isNaN(Number(payload.id_usuario)) || Number(payload.id_usuario) <= 0) {
    errors.push('El id_usuario es obligatorio y debe ser un número válido.');
  }

  if (!payload.motivo || typeof payload.motivo !== 'string' || payload.motivo.trim() === '') {
    errors.push('El motivo es obligatorio.');
  }

  return errors;
};

module.exports = {
  parseTimeValue,
  validateCreateReservationPayload,
};
