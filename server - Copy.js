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

// Ruta para manejar las solicitudes POST del formulario
app.post('/register', async (req, res) => {
    const { nombre, apellido, direccion, email, clave } = req.body;

    console.log('Datos recibidos del formulario:', { nombre, apellido, direccion, email, clave });

    if (!nombre || !apellido || !direccion || !email || !clave) {
        return res.status(400).json({ message: 'Por favor, complete todos los campos.' });
    }

    let userId; // Variable para almacenar el ID del usuario registrado

    try {
        // Conectar a la base de datos
        await connectToDatabase();

        // Consultar el ID del usuario basado en el correo electrónico
        const query = `
            SELECT id FROM resgitro_usuarios
            WHERE email = @email;
        `;

        const result = await sql.query(query, {
            email: sql.VarChar(255),
        });

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'No se encontró ningún usuario con ese correo electrónico.' });
        }

        userId = result.recordset[0].id; // Obtener el ID del usuario encontrado

        console.log('ID del usuario encontrado:', userId);

        // Ejecutar el procedimiento almacenado usando el ID del usuario
        const uspResult = await sql.query`
            EXEC usp_create_usuarios @idusuarios = ${userId};
        `;

        console.log('Resultado del procedimiento almacenado:', uspResult);

        res.status(200).json({ message: 'Registro exitoso.', userId });
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        res.status(500).json({ message: 'Error en el registro.', error: error.message });
    } finally {
        await sql.close();
    }
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor iniciado en el puerto ${PORT}`);
});