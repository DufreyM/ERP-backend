const express = require('express');
const cors = require('cors');  
const { Pool } = require('pg');
require('dotenv').config();

const authRouter = require('./services/mailService');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Configuración del pool de PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

app.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ message: 'API funcionando 🎉; siuuuu', timestamp: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al conectar con la base de datos');
  }
});

app.use('/auth', authRouter);

// Endpoint para la pantalla de visitador médico
app.get('/visitador-medico', (req, res) => {
  res.json({ message: 'Aquí irá la pantalla de visitadores médicos.' });
});

app.listen(port, () => {
  console.log(`🚀 Servidor Express en http://localhost:${port}`);
});
