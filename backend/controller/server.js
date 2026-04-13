const express = require('express');
const cors = require('cors');

const { bdmysql } = require('../lib/MySqlConnection');
const { validarJWT } = require('../middlewares/validarJWT');

class Server {

    constructor() {
        this.app = express();
        this.port = process.env.PORT || 4000;

        // 🔥 RUTAS DE TU PROYECTO
        this.paths = {
            auth: '/api/auth',
            usuarios: '/api/usuarios',
            roles: '/api/roles',
            facultades: '/api/facultades',
            reservas: '/api/reservas',
            salas: '/api/salas',
            recursos: '/api/recursos',
            auditoria: '/api/auditoria'
        };

        // TEST
        this.app.get('/', (req, res) => {
            res.send('API Gestión de Salas funcionando 🚀');
        });

        // CONEXIÓN BD
        this.dbConnection();

        // MIDDLEWARES
        this.middlewares();

        // ROUTES
        this.routes();
    }

    async dbConnection() {
        try {
            await bdmysql.authenticate();
            console.log('✅ Conectado a MySQL');
            
            // Sincronizar modelos
            await bdmysql.sync({ alter: true });
            console.log('✅ Modelos sincronizados');
        } catch (error) {
            console.error('❌ Error conexión BD:', error);
        }
    }

    middlewares() {
        // CORS
        this.app.use(cors());

        // JSON
        this.app.use(express.json());

        // carpeta pública
        this.app.use(express.static('public'));
    }

    routes() {

        // 🔐 AUTH
        this.app.use(this.paths.auth, require('../routes/auth.route'));

        // 👤 USUARIOS (requiere JWT)
        this.app.use(this.paths.usuarios, validarJWT, require('../routes/usuario.route'));

        // 🎭 ROLES
        this.app.use(this.paths.roles, validarJWT, require('../routes/rol.route'));

        // 🏫 FACULTADES
        this.app.use(this.paths.facultades, validarJWT, require('../routes/facultad.route'));

        // 📅 RESERVAS
        this.app.use(this.paths.reservas, validarJWT, require('../routes/reserva.route'));

        // 🏢 SALAS
        this.app.use(this.paths.salas, validarJWT, require('../routes/sala.route'));

        // 🖥️ RECURSOS TECNOLÓGICOS
        this.app.use(this.paths.recursos, validarJWT, require('../routes/recurso.route'));

        // 📝 AUDITORÍA
        this.app.use(this.paths.auditoria, validarJWT, require('../routes/log.route'));

        this.app.use((req, res) => {
            res.status(404).json({
                msg: 'Ruta no encontrada en el backend Express',
                method: req.method,
                path: req.originalUrl,
                hint: 'Login: POST http://localhost:4000/api/auth/login (JSON: correo, contrasena). El backend usa el puerto 4000 por defecto.',
            });
        });
    }

    listen() {
        this.app.listen(this.port, () => {
            
            console.log(`🚀 Servidor corriendo en puerto ${this.port}\n Base de datos: ${process.env.DB_NAME}`);
            
        });
    }
}

module.exports = Server;