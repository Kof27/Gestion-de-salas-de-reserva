const Usuario = require('../models/usuario');
const bcrypt = require('bcrypt');
const Rol = require('../models/rol');
const Facultad = require('../models/facultad');
const { generarJWT } = require('../helpers/generarJWT');

const login = async (req, res) => {
    const { correo, contrasena } = req.body;

    try {
        console.log('🔍 Buscando usuario con correo:', correo);
        
        // 🔍 Buscar usuario por correo con información del rol
        const usuario = await Usuario.findOne({
            where: { correo },
            include: [{
                model: Rol,
                as: 'rol',
                attributes: ['id_rol', 'nombre']
            }]
        });

        console.log('👤 Usuario encontrado:', usuario ? 'Sí' : 'No');

        // ❌ No existe
        if (!usuario) {
            return res.status(404).json({
                msg: 'Usuario no encontrado'
            });
        }

        if (usuario.estado === false) {
            return res.status(403).json({
                msg: 'Usuario deshabilitado. Contacta al administrador.'
            });
        }

        // ❌ Contraseña incorrecta
        const isPasswordValid = await bcrypt.compare(contrasena, usuario.contrasena);
        if (!isPasswordValid) {
            return res.status(400).json({
                msg: 'Contraseña incorrecta'
            });
        }

        const token = generarJWT({
            id_usuario: usuario.id_usuario,
            correo: usuario.correo,
            id_rol: usuario.id_rol,
            nombre_rol: usuario.rol.nombre,
            id_facultad: usuario.id_facultad,
        });

        const usuarioSeguro = usuario.toJSON();
        delete usuarioSeguro.contrasena;

        // ✅ Login OK
        console.log('✅ Login exitoso para:', correo);
        res.json({
            msg: 'Login exitoso',
            token,
            usuario: usuarioSeguro,
        });

    } catch (error) {
        console.error('❌ Error en login:', error);
        res.status(500).json({
            msg: 'Error en el servidor',
            error: error.message
        });
    }
};

const register = async (req, res) => {
    const { nombre, correo, contrasena, id_facultad } = req.body;

    try {
        // Validar email dominio @uao.edu.co
        if (!correo.endsWith('@uao.edu.co')) {
            return res.status(400).json({
                msg: 'El correo debe ser del dominio @uao.edu.co'
            });
        }

        // Validar contraseña: mínimo 8 caracteres, 1 mayúscula, 1 número
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!passwordRegex.test(contrasena)) {
            return res.status(400).json({
                msg: 'La contraseña debe tener al menos 8 caracteres, una mayúscula y un número'
            });
        }

        // Verificar si el usuario ya existe
        const usuarioExistente = await Usuario.findOne({
            where: { correo }
        });

        if (usuarioExistente) {
            return res.status(400).json({
                msg: 'El correo ya está registrado'
            });
        }

        // Encontrar rol por defecto "Profesor"
        const rolProfesor = await Rol.findOne({
            where: { nombre: 'Profesor' }
        });

        if (!rolProfesor) {
            return res.status(500).json({
                msg: 'Rol por defecto no encontrado'
            });
        }

        // Encontrar facultad
      const facultadExiste = await Facultad.findByPk(id_facultad);

        if (!facultadExiste) {
            return res.status(400).json({
            msg: 'La facultad seleccionada no existe'
        });
    }

        // Hash de la contraseña
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(contrasena, saltRounds);

        // Crear nuevo usuario
        const usuario = await Usuario.create({
            nombre,
            correo,
            contrasena: hashedPassword,
            id_facultad,
            id_rol: rolProfesor.id_rol,
            
        });

        res.status(201).json({
            msg: 'Usuario registrado exitosamente',
            usuario: {
                id_usuario: usuario.id_usuario,
                nombre: usuario.nombre,
                correo: usuario.correo,
                id_facultad: usuario.id_facultad,
                id_rol: usuario.id_rol,
                fecha_registro: usuario.fecha_registro
            }
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Error al registrar el usuario'
        });
    }
};
const changePassword = async (req, res) => {
    const { actual, nueva } = req.body;

    try {
        // 👤 Usuario viene del JWT (middleware validarJWT)
        const { id_usuario } = req.usuario;
        console.log(req.usuario);
        const usuario = await Usuario.findByPk(id_usuario);

        if (!usuario) {
            return res.status(404).json({
                msg: 'Usuario no encontrado'
            });
        }

        // 🔍 Validar contraseña actual
        const isValid = await bcrypt.compare(actual, usuario.contrasena);

        if (!isValid) {
            return res.status(400).json({
                msg: 'Contraseña actual incorrecta'
            });
        }

        // 🧠 Validación extra (opcional pero pro)
        if (actual === nueva) {
            return res.status(400).json({
                msg: 'La nueva contraseña no puede ser igual a la actual'
            });
        }

        // 🔐 Hashear nueva contraseña
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(nueva, saltRounds);

        // 💾 Guardar
        usuario.contrasena = hashedPassword;
        await usuario.save();

        res.json({
            msg: 'Contraseña actualizada correctamente'
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            msg: 'Error en el servidor',
            error: error.message
        });
    }
};

module.exports = {
    login,
    register,
    changePassword
};