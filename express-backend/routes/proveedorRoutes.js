const express = require('express');
const router = express.Router();
const Proveedor = require('../models/Proveedor');
const Telefono = require('../models/Telefono');
const Visitador = require('../models/VisitadorMedico');

const auth = require('../middlewares/authMiddleware');
const checkPermission = require('../middlewares/checkPermission');

// Relaciones a traer por defecto
const RELACIONES = '[telefonos, visitadores]';

router.use(auth);

// 📌 Obtener todos los proveedores
router.get('/', async (req, res) => {
  try {
    const proveedores = await Proveedor.query().withGraphFetched(RELACIONES);
    res.json(proveedores);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener proveedores', details: err.message });
  }
});

// 📌 Obtener proveedor por ID
router.get('/:id', async (req, res) => {
  try {
    const proveedor = await Proveedor.query()
      .findById(req.params.id)
      .withGraphFetched(RELACIONES);

    if (!proveedor) return res.status(404).json({ error: 'Proveedor no encontrado' });

    res.json(proveedor);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener proveedor', details: err.message });
  }
});

// 📌 Crear proveedor
router.post('/', checkPermission('crear_proveedor'), async (req, res) => {
  try {
    const nuevo = await Proveedor.query().insertGraph(req.body);
    res.status(201).json(nuevo);
  } catch (err) {
    res.status(400).json({ error: 'Error al crear proveedor', details: err.message });
  }
});

// 📌 Actualizar proveedor
router.put('/:id', checkPermission('editar_proveedor'), async (req, res) => {
  try {
    const actualizado = await Proveedor.query().patchAndFetchById(req.params.id, req.body);
    if (!actualizado) return res.status(404).json({ error: 'Proveedor no encontrado' });

    res.json(actualizado);
  } catch (err) {
    res.status(400).json({ error: 'Error al actualizar proveedor', details: err.message });
  }
});

// 📌 Eliminar proveedor
router.delete('/:id', checkPermission('eliminar_proveedor'), async (req, res) => {
  try {
    const filas = await Proveedor.query().deleteById(req.params.id);
    if (!filas) return res.status(404).json({ error: 'Proveedor no encontrado' });

    res.json({ message: 'Proveedor eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar proveedor', details: err.message });
  }
});

module.exports = router;
