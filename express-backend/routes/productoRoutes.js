const express = require('express');
const router = express.Router();
const Producto = require('../models/Producto');
const { obtenerProductosConStock } = require('../services/productoService');
const { buscarProductosConStock } = require('../services/productoService');
const authenticateToken = require('../middlewares/authMiddleware');
const cloudinary = require('../services/cloudinary');

router.use(authenticateToken);

// ✅ Obtener todos los productos con stock
router.get('/con-stock', async (req, res) => {
  try {
    const productos = await obtenerProductosConStock(req.query.local_id);
    res.json(productos);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener productos', details: err.message });
  }
});

// ✅ Obtener todos los productos
router.get('/', async (req, res) => {
  const productos = await Producto.query();
  res.json(productos);
});

// ✅ Buscar productos con stock
router.get('/search', async (req, res) => {
  const { query, local_id } = req.query;

  try {
    const productos = await buscarProductosConStock({ query, local_id });
    res.json(productos);
  } catch (err) {
    res.status(500).json({ error: 'Error al buscar productos', details: err.message });
  }
});

// ✅ Obtener producto por ID
router.get('/:id', async (req, res) => {
  const producto = await Producto.query().findById(req.params.id);
  if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
  res.json(producto);
});

// ✅ Crear producto con subida a Cloudinary
router.post('/', async (req, res) => {
  try {
    let imagenURL = null;

    // Si se sube archivo
    if (req.files?.imagen) {
      const resultado = await cloudinary.uploader.upload(req.files.imagen.tempFilePath, {
        folder: 'productos',
        resource_type: 'image',
      });
      imagenURL = resultado.secure_url;
    } else if (req.body.imagen) {
      imagenURL = req.body.imagen; // Por si viene URL directa
    }

    const nuevo = await Producto.query().insert({
      ...req.body,
      proveedor_id: parseInt(req.body.proveedor_id, 10),
      precioventa: parseFloat(req.body.precioventa),
      preciocosto: parseFloat(req.body.preciocosto),
      receta: req.body.receta === 'true' || req.body.receta === true,
      stock_minimo: parseInt(req.body.stock_minimo, 10),
      imagen: imagenURL,
    });

    res.status(201).json(nuevo);
  } catch (err) {
    res.status(400).json({ error: 'Error al crear producto', details: err.message });
  }
});

// ✅ Actualizar producto con nueva imagen opcional
router.put('/:id', async (req, res) => {
  try {
    let imagenURL = req.body.imagen;

    if (req.files?.imagen) {
      const resultado = await cloudinary.uploader.upload(req.files.imagen.tempFilePath, {
        folder: 'productos',
        resource_type: 'image',
      });
      imagenURL = resultado.secure_url;
    }

    const data = {
      ...req.body,
      precioventa: parseFloat(req.body.precioventa),
      preciocosto: parseFloat(req.body.preciocosto),
      stock_minimo: parseInt(req.body.stock_minimo, 10),
      receta: req.body.receta === 'true' || req.body.receta === true,
    };

    if (imagenURL !== undefined) {
      data.imagen = imagenURL;
    }

    const actualizado = await Producto.query().patchAndFetchById(req.params.id, data);
    if (!actualizado) return res.status(404).json({ error: 'Producto no encontrado' });

    res.json(actualizado);
  } catch (err) {
    res.status(400).json({ error: 'Error al actualizar producto', details: err.message });
  }
});

// ✅ Eliminar producto
router.delete('/:id', async (req, res) => {
  try {
    await Producto.query().deleteById(req.params.id);
    res.json({ mensaje: 'Producto eliminado' });
  } catch (err) {
    res.status(400).json({ error: 'Error al eliminar producto', details: err.message });
  }
});

module.exports = router;
