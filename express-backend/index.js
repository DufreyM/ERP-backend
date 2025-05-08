const express = require('express');
const cors = require('cors');  
require('dotenv').config();
const Knex = require('knex');
const {Model} = require('objection')
const knexConfig = require('./database/knexfile.js');
const knex = Knex(knexConfig.development);
Model.knex(knex);

const { router: authRouter } = require('./services/mailService');
const Usuario = require('./models/Usuario.js');
const Rol = require('./models/Rol.js');

const app = express();
const port = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());


app.get('/', async (req, res) => {
  try {
    const timestampResult = await knex.raw('SELECT NOW()');
    const usuariosResult = await Usuario.query() 
    const rolVisitador = await Rol.query().where('id','2')

    res.json({
      message: 'API funcionando 🎉 con Objection.js + Knex',
      timestamp: timestampResult.rows[0].now,
      usuarios: usuariosResult,
      rolEspecífico: rolVisitador
    });
  } catch (err) {
    console.error('Error en GET /:', err);
    res.status(500).send('Error al conectar con la base de datos');
  }
});

app.use('/auth', authRouter);

// Endpoint para la pantalla de visitador médico
app.get('/visitador-medico', (req, res) => {
  res.json({ message: 'Aquí irá la pantalla de visitadores médicos.' });
});

// Endpoint para la pantalla de restablecer contraseña
app.get('/reset-password', (req, res) => {
  res.json({ message: 'Aquí irá la pantalla de restablecer contraseña.' });
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`🚀 Servidor Express en http://localhost:${port}`);
  });
}

module.exports = app;
