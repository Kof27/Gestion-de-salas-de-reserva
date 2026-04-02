const Usuario = require('../models/usuario');

const login = async (req, res) => {
    const { correo, contrasena } = req.body;

    try {
        console.log('🔍 Buscando usuario con correo:', correo);
        
        // 🔍 Buscar usuario por correo
        const usuario = await Usuario.findOne({
            where: { correo }
        });

        console.log('👤 Usuario encontrado:', usuario ? 'Sí' : 'No');

        // ❌ No existe
        if (!usuario) {
            return res.status(404).json({
                msg: 'Usuario no encontrado'
            });
        }

        // ❌ Contraseña incorrecta
        if (usuario.contrasena !== contrasena) {
            return res.status(400).json({
                msg: 'Contraseña incorrecta'
            });
        }

        // ✅ Login OK
        console.log('✅ Login exitoso para:', correo);
        res.json({
            msg: 'Login exitoso',
            usuario
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
    const { nombre, correo, contrasena, id_facultad, id_rol } = req.body;

    try {
        // Verificar si el usuario ya existe
        const usuarioExistente = await Usuario.findOne({
            where: { correo }
        });

        if (usuarioExistente) {
            return res.status(400).json({
                msg: 'El correo ya está registrado'
            });
        }

        // Crear nuevo usuario
        const usuario = await Usuario.create({
            nombre,
            correo,
            contrasena,
            id_facultad,
            id_rol,
            fecha_registro: new Date()
        });

        res.status(201).json({
            msg: 'Usuario registrado exitosamente',
            usuario
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: 'Error al registrar el usuario'
        });
    }
};

module.exports = {
    login,
    register
};