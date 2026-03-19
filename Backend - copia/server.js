const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// 🔌 CONEXIÓN BD
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root', // tu contraseña
    database: 'reservas_salas',
    port: 3306
});

db.connect(err => {
    if (err) {
        console.log("Error conexión:", err);
    } else {
        console.log("Conectado a MySQL 🔥");
    }
});


// =====================
// ENDPOINTS
// =====================
app.get('/test', (req, res) => {
    db.query("SELECT * FROM usuario", (err, result) => {
        if (err) return res.json(err);
        res.json(result);
    });
});

// REGISTRO
app.post('/registro', (req, res) => {
    const { nombre, correo, contrasena, id_facultad } = req.body;

    // VALIDAR CORREO INSTITUCIONAL
    if (!correo.endsWith("@uao.edu.co")) {
        return res.json({
            error: "Solo se permiten correos institucionales"
        });
    }

    //ASIGNAR ROL AUTOMÁTICO (Profesor = 1)
    const id_rol = 1;

    const sql = `
        INSERT INTO usuario (id_facultad, id_rol, nombre, correo, contrasena)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(sql, [id_facultad, id_rol, nombre, correo, contrasena], (err) => {
        if (err) return res.json(err);
        res.json({ mensaje: "Usuario registrado como Profesor" });
    });
});

// LOGIN
app.post('/login', (req, res) => {
    const { correo, contrasena } = req.body;

    const sql = "SELECT * FROM usuario WHERE correo = ? AND contrasena = ?";

    db.query(sql, [correo, contrasena], (err, result) => {
        if (err) return res.json(err);

        if (result.length > 0) {
            res.json({ mensaje: "Login correcto", usuario: result[0] });
        } else {
            res.json({ mensaje: "Credenciales incorrectas" });
        }
    });
});


// VER SALAS
app.get('/salas', (req, res) => {
    db.query("SELECT * FROM sala_reunion", (err, result) => {
        if (err) return res.json(err);
        res.json(result);
    });
});


// CREAR RESERVA
app.post('/reserva', (req, res) => {
    const { id_sala, id_usuario, hora_inicio, hora_fin } = req.body;

    const sql = `
        INSERT INTO reserva (id_sala, id_usuario, hora_inicio, hora_fin)
        VALUES (?, ?, ?, ?)
    `;

    db.query(sql, [id_sala, id_usuario, hora_inicio, hora_fin], (err) => {
        if (err) return res.json(err);
        res.json({ mensaje: "Reserva creada" });
    });
});


// INICIAR SERVIDOR
app.listen(3000, () => {
    console.log("Servidor en http://localhost:3000 🚀");
});