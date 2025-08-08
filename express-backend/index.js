const express = require('express');
const cors = require('cors');  
const fileUpload = require('express-fileupload');
require('dotenv').config();
const Knex = require('knex');
const { Model } = require('objection');
const knexConfig = require('./database/knexfile.js');
const knex = Knex(knexConfig.development);
Model.knex(knex);

const authRouter = require('./services/mailService');
const productoRouter = require('./routes/productoRoutes');
const inventarioMovimientoRouter = require('./routes/inventarioRoutes'); 
const Usuario = require('./models/Usuario.js');
const Rol = require('./models/Rol.js');
const Inventario = require('./models/Inventario.js');
const rolesRouter = require('./routes/roles');
const localesRouter = require('./routes/locales');
const calendarioRouter = require('./routes/calendario');
const usuarioRoutes = require('./routes/profileRoutes')
const documentosLocalesRouter = require('./services/documentoLocalService');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
  origin: 'http://localhost:3001', 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true
}));


app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/'
}));

app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use('/auth', authRouter);
app.use('/api/productos', productoRouter);
app.use('/api/inventario-movimientos', inventarioMovimientoRouter);
app.use('/api/roles', rolesRouter);
app.use('/api/locales', localesRouter);
app.use('/api/calendario', calendarioRouter);
app.use('/documentos-locales', documentosLocalesRouter);
app.use('/api/usuario', usuarioRoutes);

app.get('/', async (req, res) => {
  try {
    const timestampResult = await knex.raw('SELECT NOW()');
    const inventario = await Inventario.query();
    const usuariosResult = await Usuario.query();
    const rolVisitador = await Rol.query().where('id','2');

    res.json({
      message: 'API funcionando 🎉 con Objection.js + Knex',
      timestamp: timestampResult.rows[0].now,
      usuarios: usuariosResult,
      rolEspecífico: rolVisitador,
      inventario: inventario
    });
  } catch (err) {
    console.error('Error en GET /:', err);
    res.status(500).send('Error al conectar con la base de datos');
  }
});

const visitadoresRouter = require('./routes/visitadoresRoutes');
app.use('/visitadores', visitadoresRouter);

const ventaRouter = require('./services/ventaService'); 
app.use('/ventas', ventaRouter);

app.listen(port, () => {
  console.log(`🚀 Servidor Express en http://localhost:${port}`);
});
