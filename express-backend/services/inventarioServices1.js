// Nombre del archivo: inventarioService.js

// Principales funciones y pequeña descripción de las mismas:
// 1. router.get('/'): Obtiene todos los registros de inventario, incluyendo relaciones con lote, tipoMovimiento, venta, compra, local y encargado.
// 2. router.get('/:id'): Obtiene un solo registro de inventario por ID, incluyendo las relaciones mencionadas.
// 3. router.post('/'): Crea un nuevo movimiento en el inventario con los datos proporcionados en el cuerpo de la solicitud.
// 4. router.put('/:id'): Actualiza un movimiento de inventario existente por ID, con los datos proporcionados.
// 5. router.delete('/:id'): Elimina un registro de inventario por ID.

// Archivos relacionados:
// - models/Inventario.js: Define el modelo de datos para los registros de inventario y sus relaciones.
// - database/knexfile.js: Configuración de la base de datos utilizada por Objection.js y Knex.
// - app.js o index.js: Archivo principal donde se importa e integra este servicio con la app Express principal.

// Autores:
// - Leonardo Dufrey Mejía Mejía, 23648

// Última modificación: 12/05/2025

const auth = require('../middlewares/authMiddleware');

router.use(auth);

const express = require('express');
const router = express.Router();
const Inventario = require('../models/Inventario');
const authenticateToken = require('../middlewares/authMiddleware');
router.use(authenticateToken);

// Obtener todo el inventario
router.get('/', async (req, res) => {
  try {
    const inventario = await Inventario.query().withGraphFetched('[lote, tipoMovimiento, venta, compra, local, encargado]');
    res.json(inventario);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener inventario', details: err.message });
  }
});

// Obtener un registro por ID
router.get('/:id', async (req, res) => {
  try {
    const item = await Inventario.query().findById(req.params.id).withGraphFetched('[lote, tipoMovimiento, venta, compra, local, encargado]');
    if (!item) {
      return res.status(404).json({ error: 'Registro no encontrado' });
    }
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener el registro', details: err.message });
  }
});

// Crear un nuevo movimiento en inventario
router.post('/', async (req, res) => {
  try {
    const nuevo = await Inventario.query().insert(req.body);
    res.status(201).json(nuevo);
  } catch (err) {
    res.status(400).json({ error: 'Error al crear el registro', details: err.message });
  }
});

// Actualizar un registro existente
router.put('/:id', async (req, res) => {
  try {
    const actualizado = await Inventario.query().patchAndFetchById(req.params.id, req.body);
    if (!actualizado) {
      return res.status(404).json({ error: 'Registro no encontrado' });
    }
    res.json(actualizado);
  } catch (err) {
    res.status(400).json({ error: 'Error al actualizar el registro', details: err.message });
  }
});

// Eliminar un registro
router.delete('/:id', async (req, res) => {
  try {
    const filasEliminadas = await Inventario.query().deleteById(req.params.id);
    if (!filasEliminadas) {
      return res.status(404).json({ error: 'Registro no encontrado' });
    }
    res.json({ mensaje: 'Registro eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar el registro', details: err.message });
  }
});

module.exports = router;
