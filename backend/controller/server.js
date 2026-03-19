const express = require('express');
const cors = require('cors');

const { bdmysql } = require('../lib/MySqlConnection');

class Server {

    constructor() {
        this.app = express();
        this.port = process.env.PORT || 3000;

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

        // 👤 USUARIOS
        this.app.use(this.paths.usuarios, require('../routes/usuario.route'));

        // 🎭 ROLES
        this.app.use(this.paths.roles, require('../routes/rol.route'));

        // 🏫 FACULTADES
        this.app.use(this.paths.facultades, require('../routes/facultad.route'));

        // 📅 RESERVAS
        this.app.use(this.paths.reservas, require('../routes/reserva.route'));

        // 🏢 SALAS
        this.app.use(this.paths.salas, require('../routes/sala.route'));

        // 🖥️ RECURSOS TECNOLÓGICOS
        this.app.use(this.paths.recursos, require('../routes/recurso.route'));

        // 📝 AUDITORÍA
        this.app.use(this.paths.auditoria, require('../routes/log.route'));
    }

    listen() {
        this.app.listen(this.port, () => {
            console.log(`🚀 Servidor corriendo en puerto ${this.port}`);
        });
    }
}

module.exports = Server;