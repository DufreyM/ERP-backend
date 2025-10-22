const router = require('express').Router();
const Cliente = require('../models/Cliente');
const auth = require('../middlewares/authMiddleware');

router.use(auth);

// GET /clientes?nit=XXXX  (búsqueda exacta por NIT)
//no necesita filtrado
router.get('/', async (req,res)=>{
  const { nit } = req.query;
  if (!nit) return res.status(400).json({ error:'nit requerido' });
  const c = await Cliente.query().findOne({ nit });
  if (!c) return res.status(404).json({ error:'no encontrado' });
  res.json(c);
});

// POST /clientes  (crear o actualizar por NIT)
router.post('/', async (req, res) => {
  const { nit, nombre, direccion, correo, totalCompra } = req.body;

  // 1. Verificación de campos requeridos
  if (!nombre||!nit) {
    return res.status(400).json({ error: 'nombre requerido' });
  }

  // 2. Si la compra es mayor a Q2500, NIT es obligatorio
  if (totalCompra && totalCompra > 2500 && !nit) {
    return res.status(400).json({ error: 'NIT es obligatorio para compras mayores a Q2500' });
  }

  // 3. Si se proporciona NIT, validar formato
  if (nit && !esNitValido(nit)) {
    return res.status(400).json({ error: 'NIT inválido' });
  }

  // 4. upsert por nit
  const c = await Cliente.query()
    .insert({ nit, nombre, direccion: direccion ?? null, correo: correo ?? null })
    .onConflict('nit')
    .merge()
    .returning('*');

  res.status(201).json(c);
});


function esNitValido(nit) {
  const limpio = nit.trim().replace(/-/g, '');
  return /^[0-9]+[0-9kK]$/.test(limpio);
}

module.exports = router;
