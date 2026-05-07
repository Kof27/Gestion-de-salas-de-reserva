const Usuario = require('../models/usuario');
const bcrypt = require('bcrypt');
const Rol = require('../models/rol');
const Facultad = require('../models/facultad');
const Whitelist = require('../models/whitelist');

const { generarJWT } = require('../helpers/generarJWT');

const login = async (req, res) => {
    const { correo, contrasena } = req.body;

    try {
        console.log('🔍 Buscando usuario con correo:', correo);
        console.log('BODY RECIBIDO:', req.body);

        // 🔍 Buscar usuario por correo
        const usuario = await Usuario.findOne({
            where: { correo }
        });

        console.log('👤 Usuario encontrado:', usuario ? 'Sí' : 'No');

        // ❌ Usuario no existe
        if (!usuario) {
            return res.status(404).json({
                msg: 'Usuario no encontrado'
            });
        }

        // ❌ Usuario deshabilitado
        if (usuario.estado === false) {
            return res.status(403).json({
                msg: 'Usuario deshabilitado. Contacta al administrador.'
            });
        }

        // 🔐 Validar contraseña
        const isPasswordValid = await bcrypt.compare(
            contrasena,
            usuario.contrasena
        );

        console.log(
            '🔐 Validación de contraseña:',
            isPasswordValid ? 'Correcta' : 'Incorrecta'
        );

        if (!isPasswordValid) {
            return res.status(400).json({
                msg: 'Contraseña incorrecta'
            });
        }

        // 🎫 Generar token
        const token = generarJWT({
            id_usuario: usuario.id_usuario,
            correo: usuario.correo,
            id_rol: usuario.id_rol,
            id_facultad: usuario.id_facultad,
        });

        // 🚫 No enviar contraseña
        const usuarioSeguro = usuario.toJSON();
        delete usuarioSeguro.contrasena;

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
    const {
        nombre,
        correo,
        contrasena,
        confirmarContrasena,
        id_facultad
    } = req.body;

    try {

        console.log('📥 BODY REGISTER:', req.body);

        // 📧 Validar dominio institucional
        if (!correo.endsWith('@uao.edu.co')) {
            return res.status(400).json({
                msg: 'El correo debe ser del dominio @uao.edu.co'
            });
        }

        // 🔐 Validar contraseña
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

        if (!passwordRegex.test(contrasena)) {
            return res.status(400).json({
                msg: 'La contraseña debe tener al menos 8 caracteres, una mayúscula y un número'
            });
        }



        // 👤 Verificar usuario existente
        const usuarioExistente = await Usuario.findOne({
            where: { correo }
        });

        if (usuarioExistente) {
            return res.status(400).json({
                msg: 'El correo ya está registrado'
            });
        }

        // 🏫 Validar facultad
        const facultadExiste = await Facultad.findByPk(id_facultad);

        console.log('🏫 ID FACULTAD:', id_facultad);

        if (!facultadExiste) {
            return res.status(400).json({
                msg: 'La facultad seleccionada no existe'
            });
        }

        // 📋 Revisar whitelist
        const correoWhitelist = await Whitelist.findOne({
            where: { correo }
        });

        let rol;

        // 🎭 Si está en whitelist => Secretaria
        if (correoWhitelist) {

            console.log('✅ Correo encontrado en whitelist');

            rol = await Rol.findOne({
                where: { id_rol: 2 }
            });

        } else {

            console.log('ℹ️ Correo NO está en whitelist');

            // 👨‍🏫 Profesor por defecto
            rol = await Rol.findOne({
                where: { id_rol: 1 }
            });
        }

        if (!rol) {
            return res.status(500).json({
                msg: 'No se encontró el rol correspondiente'
            });
        }

        // 🔒 Hash contraseña
        const saltRounds = 10;

        const hashedPassword = await bcrypt.hash(
            contrasena,
            saltRounds
        );

        // 👤 Crear usuario
        const usuario = await Usuario.create({
            nombre,
            correo,
            contrasena: hashedPassword,
            id_facultad,
            id_rol: rol.id_rol,
        });

        // 🚫 No enviar contraseña
        const usuarioSeguro = usuario.toJSON();
        delete usuarioSeguro.contrasena;

        console.log('✅ Usuario registrado:', correo);

        res.status(201).json({
            msg: 'Usuario registrado exitosamente',
            usuario: usuarioSeguro
        });

    } catch (error) {

        console.error('❌ Error en register:', error);

        res.status(500).json({
            msg: 'Error al registrar el usuario',
            error: error.message
        });
    }
};

const changePassword = async (req, res) => {

    const {
        actual,
        nueva,
        confirmarNueva
    } = req.body;

    try {

        // 👤 Usuario autenticado
        const { id_usuario } = req.usuarioAuth;

        console.log('👤 Usuario autenticado:', req.usuarioAuth);

        const usuario = await Usuario.findByPk(id_usuario);

        // ❌ Usuario no existe
        if (!usuario) {
            return res.status(404).json({
                msg: 'Usuario no encontrado'
            });
        }

        // 🔍 Validar contraseña actual
        const isValid = await bcrypt.compare(
            actual,
            usuario.contrasena
        );

        if (!isValid) {
            return res.status(400).json({
                msg: 'Contraseña actual incorrecta'
            });
        }

        // 🔁 Confirmar nueva contraseña
        if (nueva !== confirmarNueva) {
            return res.status(400).json({
                msg: 'Las nuevas contraseñas no coinciden'
            });
        }

        // 🚫 Evitar misma contraseña
        if (actual === nueva) {
            return res.status(400).json({
                msg: 'La nueva contraseña no puede ser igual a la actual'
            });
        }

        // 🔐 Validar formato nueva contraseña
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

        if (!passwordRegex.test(nueva)) {
            return res.status(400).json({
                msg: 'La nueva contraseña debe tener al menos 8 caracteres, una mayúscula y un número'
            });
        }

        // 🔒 Hashear nueva contraseña
        const saltRounds = 10;

        const hashedPassword = await bcrypt.hash(
            nueva,
            saltRounds
        );

        // 💾 Guardar nueva contraseña
        usuario.contrasena = hashedPassword;

        await usuario.save();

        console.log('✅ Contraseña actualizada');

        res.json({
            msg: 'Contraseña actualizada correctamente'
        });

    } catch (error) {

        console.error('❌ Error en changePassword:', error);

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