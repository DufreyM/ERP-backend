const express = require('express');
const router = express.Router();
const Producto = require('../models/Producto');
const { obtenerProductosConStock } = require('../services/productoService');
const { buscarProductosConStock } = require('../services/productoService');

const auth = require('../middlewares/authMiddleware');

router.use(auth);

// Obtener todos los productos con su stock
router.get('/con-stock', async (req, res) => {
  try {
    const productos = await obtenerProductosConStock(req.query.local_id);
    res.json(productos);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener productos', details: err.message });
  }
});

// CRUD tradicional
router.get('/', async (req, res) => {
  const productos = await Producto.query();
  res.json(productos);
});


router.get('/search', async (req, res) => {
  const { query, local_id } = req.query;

  try {
    const productos = await buscarProductosConStock({ query, local_id });
    res.json(productos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al buscar productos', details: err.message });
  }
});

router.get('/:id', async (req, res) => {
  const producto = await Producto.query().findById(req.params.id);
  if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
  res.json(producto);
});

router.post('/', async (req, res) => {
  try {
    const nuevo = await Producto.query().insert(req.body);
    res.status(201).json(nuevo);
  } catch (err) {
    res.status(400).json({ error: 'Error al crear producto', details: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const actualizado = await Producto.query().patchAndFetchById(req.params.id, req.body);
    res.json(actualizado);
  } catch (err) {
    res.status(400).json({ error: 'Error al actualizar producto', details: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const eliminado = await Producto.query().deleteById(req.params.id);
    res.json({ mensaje: 'Producto eliminado' });
  } catch (err) {
    res.status(400).json({ error: 'Error al eliminar producto', details: err.message });
  }
});


module.exports = router;
