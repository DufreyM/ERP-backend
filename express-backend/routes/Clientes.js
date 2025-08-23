const router = require('express').Router();
const Cliente = require('../models/Cliente');
const auth = require('../middlewares/authMiddleware');

router.use(auth);

// GET /clientes?nit=XXXX  (búsqueda exacta por NIT)
router.get('/', async (req,res)=>{
  const { nit } = req.query;
  if (!nit) return res.status(400).json({ error:'nit requerido' });
  const c = await Cliente.query().findOne({ nit });
  if (!c) return res.status(404).json({ error:'no encontrado' });
  res.json(c);
});

// POST /clientes  (crear o actualizar por NIT)
router.post('/', async (req,res)=>{
  const { nit, nombre, direccion, correo } = req.body;
  if (!nit || !nombre) return res.status(400).json({ error:'nit y nombre requeridos' });

  // upsert por nit
  const c = await Cliente.query()
    .insert({ nit, nombre, direccion: direccion ?? null, correo: correo ?? null })
    .onConflict('nit').merge()      // requiere PG/MySQL 8; en SQLite usar alternativa
    .returning('*');

  res.status(201).json(c);
});

module.exports = router;
