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
const { registrarMovimiento } = require('../services/inventarioService');
const validarMovimiento = require('../middlewares/validarMovimiento');

router.post('/', validarMovimiento, async (req, res) => {
  try {
    const resultado = await registrarMovimiento(req.body);
    res.status(201).json(resultado);
  } catch (err) {
    res.status(400).json({ error: 'Error al registrar movimiento', details: err.message });
  }
});

module.exports = router;
