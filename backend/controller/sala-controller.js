const SalaReunion    = require('../models/sala_reunion');
const Facultad       = require('../models/facultad');
const LogAuditoria   = require('../models/log_auditoria');
 

const ROL_SECRETARIA = 'secretario';
 

const registrarLog = async (id_usuario, accion, entidad, detalle) => {
  try {
    await LogAuditoria.create({ id_usuario, accion, entidad, detalle });
  } catch (err) {
    // El log nunca debe romper el flujo principal
    console.error('[Auditoría] Error al registrar log:', err.message);
  }
};

const crearSala = async (req, res) => {
  try {
    const { id_usuario, id_rol, nombre_rol, id_facultad, correo } = req.usuario;

    // Debug: mostrar qué datos llegan del JWT
    console.log('[crearSala] Usuario autenticado:', {
      id_usuario,
      id_rol,
      nombre_rol,
      id_facultad,
      correo
    });

    // Validar que es secretaria
    const esSecretaria = nombre_rol.toLowerCase() === ROL_SECRETARIA.toLowerCase();

    if (!esSecretaria) {
      console.log(`[crearSala] ❌ Acceso denegado. Rol actual: ${nombre_rol}, requerido: ${ROL_SECRETARIA}`);
      return res.status(403).json({
        msg: `Acceso denegado. Solo la secretaria puede crear salas de reuniones. Tu rol actual es: ${nombre_rol}`,
      });
    }
 
    const { nombre, capacidad, ubicacion, descripcion, imagen_sala } = req.body;
 
   
    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({ msg: 'El nombre de la sala es obligatorio.' });
    }
 
    if (capacidad === undefined || capacidad === null || capacidad === '') {
      return res.status(400).json({ msg: 'La capacidad de la sala es obligatoria.' });
    }
 
    const capacidadNum = parseInt(capacidad, 10);
    if (isNaN(capacidadNum) || capacidadNum <= 0) {
      return res.status(400).json({
        msg: 'La capacidad debe ser un número entero mayor a 0.',
      });
    }
 
    
    const facultad = await Facultad.findByPk(id_facultad);
    if (!facultad) {
      return res.status(400).json({
        msg: 'La facultad asociada al usuario no existe en el sistema.',
      });
    }
 
    
    const salaExistente = await SalaReunion.findOne({
      where: { nombre: nombre.trim(), id_facultad },
    });
 
    if (salaExistente) {
      return res.status(409).json({
        msg: `Ya existe una sala llamada "${nombre.trim()}" en tu facultad.`,
      });
    }
 
   
    const nuevaSala = await SalaReunion.create({
      id_facultad,
      nombre:      nombre.trim(),
      capacidad:   capacidadNum,
      ubicacion:   ubicacion   ? ubicacion.trim()   : null,
      descripcion: descripcion ? descripcion.trim() : null,
      estado:      'activo',   
      imagen_sala: imagen_sala || null,
    });
 
    await registrarLog(
      id_usuario,
      'CREAR',
      'sala_reunion',
      `Secretaria (${correo}) creó la sala "${nuevaSala.nombre}" ` +
      `(id: ${nuevaSala.id_sala}) en la facultad id=${id_facultad}.`
    );
 
   
    return res.status(201).json({
      msg:  'Sala de reuniones creada exitosamente.',
      sala: nuevaSala,
    });
 
  } catch (error) {
    console.error('[crearSala] Error:', error);
    return res.status(500).json({
      msg:   'Error interno al crear la sala de reuniones.',
      error: error.message,
    });
  }
};
 
const listarSalas = async (req, res) => {
  try {
    const { id_facultad } = req.usuario;
 
    const salas = await SalaReunion.findAll({
      where: { id_facultad },
      order: [['nombre', 'ASC']],
    });
 
    return res.json(salas);
  } catch (error) {
    console.error('[listarSalas] Error:', error);
    return res.status(500).json({
      msg:   'Error al obtener las salas.',
      error: error.message,
    });
  }
};
 
const obtenerSala = async (req, res) => {
  try {
    const { id_facultad } = req.usuario;
    const { id } = req.params;
 
    const sala = await SalaReunion.findOne({
      where: { id_sala: id, id_facultad },
    });
 
    if (!sala) {
      return res.status(404).json({ msg: 'Sala no encontrada en tu facultad.' });
    }
 
    return res.json(sala);
  } catch (error) {
    console.error('[obtenerSala] Error:', error);
    return res.status(500).json({
      msg:   'Error al obtener la sala.',
      error: error.message,
    });
  }
};

const actualizarSala = async (req, res) => {
  try {
    const { id_usuario, id_rol, nombre_rol, id_facultad, correo } = req.usuario;
    const { id } = req.params;

    const esSecretaria = nombre_rol.toLowerCase() === ROL_SECRETARIA.toLowerCase();

    if (!esSecretaria) {
      return res.status(403).json({
        msg: `Acceso denegado. Solo la secretaria puede actualizar salas de reuniones. Tu rol actual es: ${nombre_rol}`,
      });
    }

    // Verificar que la sala existe y pertenece a su facultad
    const sala = await SalaReunion.findOne({
      where: { id_sala: id, id_facultad },
    });

    if (!sala) {
      return res.status(404).json({ msg: 'Sala no encontrada en tu facultad.' });
    }

    const { nombre, capacidad, ubicacion, descripcion, imagen_sala, estado } = req.body;

    // Validar nombre si se intenta cambiar
    if (nombre && nombre.trim() !== '') {
      if (nombre.trim() !== sala.nombre) {
        const salaExistente = await SalaReunion.findOne({
          where: { nombre: nombre.trim(), id_facultad },
        });
        if (salaExistente) {
          return res.status(409).json({
            msg: `Ya existe una sala llamada "${nombre.trim()}" en tu facultad.`,
          });
        }
      }
    }

    // Validar capacidad si se intenta cambiar
    if (capacidad !== undefined && capacidad !== null && capacidad !== '') {
      const capacidadNum = parseInt(capacidad, 10);
      if (isNaN(capacidadNum) || capacidadNum <= 0) {
        return res.status(400).json({
          msg: 'La capacidad debe ser un número entero mayor a 0.',
        });
      }
    }

    // Preparar datos a actualizar
    const datosActualizar = {};
    if (nombre && nombre.trim() !== '') datosActualizar.nombre = nombre.trim();
    if (capacidad !== undefined && capacidad !== null) datosActualizar.capacidad = parseInt(capacidad, 10);
    if (ubicacion !== undefined) datosActualizar.ubicacion = ubicacion ? ubicacion.trim() : null;
    if (descripcion !== undefined) datosActualizar.descripcion = descripcion ? descripcion.trim() : null;
    if (imagen_sala !== undefined) datosActualizar.imagen_sala = imagen_sala || null;
    if (estado !== undefined) datosActualizar.estado = estado;

    // Si no hay cambios, retornar la sala sin cambios
    if (Object.keys(datosActualizar).length === 0) {
      return res.json({
        msg: 'No hay cambios para actualizar.',
        sala: sala,
      });
    }

    // Actualizar sala
    await sala.update(datosActualizar);

    await registrarLog(
      id_usuario,
      'ACTUALIZAR',
      'sala_reunion',
      `Secretaria (${correo}) actualizó la sala "${sala.nombre}" (id: ${sala.id_sala}).`
    );

    return res.json({
      msg: 'Sala de reuniones actualizada exitosamente.',
      sala: sala,
    });

  } catch (error) {
    console.error('[actualizarSala] Error:', error);
    return res.status(500).json({
      msg:   'Error interno al actualizar la sala de reuniones.',
      error: error.message,
    });
  }
};

const eliminarSala = async (req, res) => {
  try {
    const { id_usuario, id_rol, nombre_rol, id_facultad, correo } = req.usuario;
    const { id } = req.params;

    const esSecretaria = nombre_rol.toLowerCase() === ROL_SECRETARIA.toLowerCase();

    if (!esSecretaria) {
      return res.status(403).json({
        msg: `Acceso denegado. Solo la secretaria puede eliminar salas de reuniones. Tu rol actual es: ${nombre_rol}`,
      });
    }

    // Verificar que la sala existe y pertenece a su facultad
    const sala = await SalaReunion.findOne({
      where: { id_sala: id, id_facultad },
    });

    if (!sala) {
      return res.status(404).json({ msg: 'Sala no encontrada en tu facultad.' });
    }

    const nombreSala = sala.nombre;
    const idSala = sala.id_sala;

    // Eliminar sala
    await sala.destroy();

    await registrarLog(
      id_usuario,
      'ELIMINAR',
      'sala_reunion',
      `Secretaria (${correo}) eliminó la sala "${nombreSala}" (id: ${idSala}).`
    );

    return res.json({
      msg: 'Sala de reuniones eliminada exitosamente.',
      id_sala: idSala,
    });

  } catch (error) {
    console.error('[eliminarSala] Error:', error);
    return res.status(500).json({
      msg:   'Error interno al eliminar la sala de reuniones.',
      error: error.message,
    });
  }
};
 
module.exports = {
  crearSala,
  listarSalas,
  obtenerSala,
  actualizarSala,
  eliminarSala,
};