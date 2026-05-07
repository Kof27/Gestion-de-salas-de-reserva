/**
 * Middlewares para validar roles de usuario.
 * 
 * ROLES:
 * - Docente (id_rol = 1)
 * - Secretaria (id_rol = 2)
 * 
 * Uso en rutas:
 * router.get('/ruta', validarJWT, esDocente, controlador);
 * router.delete('/ruta', validarJWT, esSecretaria, controlador);
 */

const esDocente = (req, res, next) => {
    if (!req.usuarioAuth) {
        return res.status(401).json({ 
            msg: 'No autenticado. Falta token JWT.' 
        });
    }

    const { id_rol } = req.usuarioAuth;

    if (id_rol !== 1) {
        return res.status(403).json({ 
            msg: 'Acceso denegado. Solo docentes pueden realizar esta acción.',
            id_rol_actual: id_rol
        });
    }

    next();
};

const esSecretaria = (req, res, next) => {
    if (!req.usuarioAuth) {
        return res.status(401).json({ 
            msg: 'No autenticado. Falta token JWT.' 
        });
    }

    const { id_rol } = req.usuarioAuth;

    if (id_rol !== 2) {
        return res.status(403).json({ 
            msg: 'Acceso denegado. Solo secretarias pueden realizar esta acción.',
            id_rol_actual: id_rol
        });
    }

    next();
};

/**
 * Middleware flexible que permite múltiples roles.
 * Uso: esUnoDe([1, 2], controlador)
 */
const esUnoDe = (rolesPermitidos) => {
    return (req, res, next) => {
        if (!req.usuarioAuth) {
            return res.status(401).json({ 
                msg: 'No autenticado. Falta token JWT.' 
            });
        }

        const { id_rol } = req.usuarioAuth;

        if (!rolesPermitidos.includes(id_rol)) {
            return res.status(403).json({ 
                msg: 'Acceso denegado. Rol insuficiente para esta acción.',
                id_rol_actual: id_rol,
                roles_permitidos: rolesPermitidos
            });
        }

        next();
    };
};

module.exports = {
    esDocente,
    esSecretaria,
    esUnoDe,
};
