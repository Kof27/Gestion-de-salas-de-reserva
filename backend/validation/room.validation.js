const isNonEmptyString = (value) => typeof value === 'string' && value.trim() !== '';

const validateCreateRoomPayload = (payload) => {
  const errors = [];

  if (!payload || typeof payload !== 'object') {
    errors.push('Payload inválido.');
    return errors;
  }

  if (!isNonEmptyString(payload.nombre)) {
    errors.push('El nombre de la sala es obligatorio.');
  }

  if (!isNonEmptyString(payload.ubicacion)) {
    errors.push('La ubicación es obligatoria.');
  }

  const capacidad = Number(payload.capacidad);
  if (Number.isNaN(capacidad)) {
    errors.push('La capacidad debe ser un número.');
  } else if (capacidad < 2 || capacidad > 100) {
    errors.push('La capacidad debe estar entre 2 y 100.');
  }

  const idFacultad = Number(payload.id_facultad);
  if (Number.isNaN(idFacultad) || idFacultad <= 0) {
    errors.push('El id_facultad es obligatorio y debe ser un número válido.');
  }

  return errors;
};

const validateUpdateRoomPayload = (payload) => {
  const errors = [];

  if (!payload || typeof payload !== 'object') {
    errors.push('Payload inválido.');
    return errors;
  }

  if (payload.nombre !== undefined && !isNonEmptyString(payload.nombre)) {
    errors.push('El nombre de la sala no puede estar vacío.');
  }

  if (payload.ubicacion !== undefined && !isNonEmptyString(payload.ubicacion)) {
    errors.push('La ubicación no puede estar vacía.');
  }

  if (payload.capacidad !== undefined) {
    const capacidad = Number(payload.capacidad);
    if (Number.isNaN(capacidad)) {
      errors.push('La capacidad debe ser un número.');
    } else if (capacidad < 2 || capacidad > 100) {
      errors.push('La capacidad debe estar entre 2 y 100.');
    }
  }

  return errors;
};

module.exports = {
  validateCreateRoomPayload,
  validateUpdateRoomPayload,
};
