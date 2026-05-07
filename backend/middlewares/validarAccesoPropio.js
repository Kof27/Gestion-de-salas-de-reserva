/**
 * Middleware para validar que un docente solo acceda a sus propios datos.
 * 
 * Los docentes pueden consultar/actualizar/eliminar solo sus propios registros.
 * Las secretarias pueden acceder a todos los registros.
 * 
 * Este middleware valida que:
 * - Si es docente (id_rol = 1) y el parámetro id_usuario no coincide → error 403
 * - Si es secretaria (id_rol = 2) → permite acceso
 * 
 * Uso en rutas:
 * router.get('/:userId', validarJWT, validarAccesoPropio, controlador);
 */

const validarAccesoPropio = (req, res, next) => {
    if (!req.usuarioAuth) {
        return res.status(401).json({ 
            msg: 'No autenticado. Falta token JWT.' 
        });
    }

    const { id_rol, id_usuario: usuarioDelToken } = req.usuarioAuth;
    const idUsuarioSolicitado = parseInt(req.params.userId || req.body.id_usuario);

    // Secretaria: acceso a todos
    if (id_rol === 2) {
        return next();
    }

    // Docente: solo a los suyos
    if (id_rol === 1) {
        if (idUsuarioSolicitado !== usuarioDelToken) {
            return res.status(403).json({ 
                msg: 'Acceso denegado. Solo puedes acceder a tus propios datos.',
                id_usuario_tuyo: usuarioDelToken,
                id_usuario_solicitado: idUsuarioSolicitado
            });
        }
        return next();
    }

    return res.status(403).json({ 
        msg: 'Rol no reconocido.',
        id_rol
    });
};

module.exports = {
    validarAccesoPropio,
};
