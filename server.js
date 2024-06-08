const express = require('express');
const bodyParser = require('body-parser');
const sql = require('mssql');
const dotenv = require('dotenv');
const cors = require('cors');

// Cargar variables de entorno desde el archivo .env
dotenv.config();

console.log(process.env.DB_USER, process.env.DB_PASSWORD, process.env.DB_SERVER, process.env.DB_DATABASE);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para permitir solicitudes CORS y analizar el cuerpo de las solicitudes
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Configuración de la conexión a la base de datos
const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    options: {
        encrypt: true, // Si estás utilizando Azure, asegúrate de habilitar la encriptación
        enableArithAbort: true
    }
};

// Ruta para manejar las solicitudes POST del formulario
app.post('/register', async (req, res) => {
    const { nombre, apellido, direccion, email, clave } = req.body;

    // Agregar registro console.log para verificar los datos recibidos del formulario
    console.log('Datos recibidos del formulario:', { nombre, apellido, direccion, email, clave });

    // Verificar que nombre no sea undefined o null
    if (!nombre) {
        return res.status(400).send('El nombre es obligatorio.');
    }

    try {
        // Conectar con la base de datos
        await sql.connect(config);

        // Insertar los datos en la base de datos
        const result = await sql.query`INSERT INTO resgitro_usuarios (nombre, apellido, direccion, email, clave) VALUES (${nombre}, ${apellido}, ${direccion}, ${email}, ${clave})`;

        console.log(result);
        res.send('Registro exitoso.');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error en el registro.');
    } finally {
        // Cerrar la conexión
        await sql.close();
    }
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor iniciado en el puerto ${PORT}`);
});