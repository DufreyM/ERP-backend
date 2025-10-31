// Nombre del archivo: inventarioRoutes.js

// Principales rutas y pequeña descripción de las mismas:
// 1. POST /: Registra un movimiento de inventario (entrada o salida) validando el tipo de movimiento y cantidad.

// Archivos relacionados:
// - services/inventarioService.js: Contiene la lógica para registrar movimientos de inventario.
// - middlewares/validarMovimiento.js: Middleware que valida y ajusta la cantidad según el tipo de movimiento.
// - app.js o index.js: Punto de entrada donde se importa este router.

// Autor: Leonardo Dufrey Mejía Mejía, 23648
// Última modificación: 20/07/2025


const express = require('express');
const router = express.Router();
const Inventario = require('../models/Inventario');
const validarMovimiento = require('../middlewares/validarMovimiento');
const authenticateToken = require('../middlewares/authMiddleware');
const checkPermission = require('../middlewares/checkPermission');

router.use(authenticateToken);

// Obtener todo el inventario
router.get(
  '/',
  checkPermission('ver_inventario'),
  async (req, res) => {
    try {
      console.log("Permiso: ver_inventario")
      const inventario = await Inventario.query().withGraphFetched('[lote, tipoMovimiento, venta, compra, local, encargado]');
      res.json(inventario);
    } catch (err) {
      res.status(500).json({ error: 'Error al obtener inventario', details: err.message });
    }
  }
);

// Obtener un registro por ID
router.get(
  '/:id',
  checkPermission('ver_inventario'),
  async (req, res) => {
    try {
      const item = await Inventario.query().findById(req.params.id).withGraphFetched('[lote, tipoMovimiento, venta, compra, local, encargado]');
      if (!item) return res.status(404).json({ error: 'Registro no encontrado' });
      res.json(item);
    } catch (err) {
      res.status(500).json({ error: 'Error al obtener el registro', details: err.message });
    }
  }
);

// Crear un nuevo movimiento
router.post(
  '/',
  checkPermission('registrar_movimiento'),
  validarMovimiento,
  async (req, res) => {
    try {
      const nuevo = await Inventario.query().insert(req.body);
      res.status(201).json(nuevo);
    } catch (err) {
      res.status(400).json({ error: 'Error al crear el registro', details: err.message });
    }
  }
);

// Editar movimiento
router.put(
  '/:id',
  checkPermission('editar_movimiento_inventario'),
  async (req, res) => {
    try {
      const actualizado = await Inventario.query().patchAndFetchById(req.params.id, req.body);
      if (!actualizado) return res.status(404).json({ error: 'Registro no encontrado' });
      res.json(actualizado);
    } catch (err) {
      res.status(400).json({ error: 'Error al actualizar el registro', details: err.message });
    }
  }
);

// Eliminar movimiento
router.delete(
  '/:id',
  checkPermission('eliminar_movimiento_inventario'),
  async (req, res) => {
    try {
      const eliminado = await Inventario.query().deleteById(req.params.id);
      if (!eliminado) return res.status(404).json({ error: 'Registro no encontrado' });
      res.json({ mensaje: 'Registro eliminado correctamente' });
    } catch (err) {
      res.status(500).json({ error: 'Error al eliminar el registro', details: err.message });
    }
  }
);

module.exports = router;
