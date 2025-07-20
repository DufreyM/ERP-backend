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
