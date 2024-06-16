const express = require('express');
const bodyParser = require('body-parser');
const sql = require('mssql');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    options: {
        encrypt: true,
        enableArithAbort: true
    }
};

// Función para conectar a la base de datos
async function connectToDatabase() {
    try {
        await sql.connect(config);
        console.log('Conexión establecida con la base de datos.');
    } catch (error) {
        console.error('Error al conectar con la base de datos:', error.message);
    }
}

// Ruta para manejar las solicitudes POST del registro e inicio de sesión

// Registro de usuarios
app.post('/register', async (req, res) => {
    const { nombre, apellido, direccion, email, clave } = req.body;

    console.log('Datos recibidos del formulario de registro:', { nombre, apellido, direccion, email, clave });

    if (!nombre || !apellido || !direccion || !email || !clave) {
        return res.status(400).json({ message: 'Por favor, complete todos los campos.' });
    }

    try {
        // Conectar a la base de datos
        await connectToDatabase();

        // Insertar usuario en la base de datos
        const insertQuery = `
            INSERT INTO registro_usuarios (nombre, apellido, direccion, email, clave)
            VALUES (@nombre, @apellido, @direccion, @email, @clave);
        `;

        const result = await sql.query(insertQuery, {
            nombre: sql.VarChar(255),
            apellido: sql.VarChar(255),
            direccion: sql.VarChar(255),
            email: sql.VarChar(255),
            clave: sql.VarChar(255)
        });

        console.log('Usuario registrado exitosamente.');

        res.status(201).json({ message: 'Registro exitoso.' });
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        res.status(500).json({ message: 'Error en el registro.', error: error.message });
    } finally {
        await sql.close();
    }
});

// Inicio de sesión de usuarios
app.post('/login', async (req, res) => {
    const { codigo, clave } = req.body;

    console.log('Datos recibidos del formulario de inicio de sesión:', { codigo, clave });

    if (!codigo || !clave) {
        return res.status(400).json({ message: 'Por favor, ingrese código y clave.' });
    }

    try {
        // Conectar a la base de datos
        await connectToDatabase();

        // Consultar el usuario con el código y clave proporcionados
        const query = `
            SELECT codigo, clave
            FROM usuarios
            WHERE codigo = '${codigo}'
            AND clave = '${clave}';
        `;

        const result = await sql.query(query);
        
        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Código o clave incorrectos.' });
        }

        console.log('Usuario encontrado:', result.recordset[0]);

        res.status(200).json({ message: 'Inicio de sesión exitoso.', user: result.recordset[0] });
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        res.status(500).json({ message: 'Error en el inicio de sesión.', error: error.message });
    } finally {
        await sql.close();
    }
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor iniciado en el puerto ${PORT}`);
});


