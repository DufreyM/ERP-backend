const express = require('express');
const router = express.Router();
const { raw } = require('objection');
const Permiso = require('../models/Permiso');
const Modulo = require('../models/Modulo');
const checkPermission = require('../middlewares/checkPermission');
const authenticateToken = require('../middlewares/authMiddleware');

// Obtener todos los módulos
router.get('/modulos', authenticateToken, checkPermission('ver_modulos'), async (req, res) => {
  try {
    const modulos = await Modulo.query();
    res.json(modulos);
  } catch (err) {
    res.status(500).json({ error: 'Error obteniendo módulos' });
  }
});

// Obtener todos los permisos
router.get('/', authenticateToken, checkPermission('ver_permisos'), async (req, res) => {
  try {
    const permisos = await Permiso.query().withGraphFetched('modulo');
    res.json(permisos);
  } catch (err) {
    res.status(500).json({ error: 'Error obteniendo permisos' });
  }
});

// Crear permiso
router.post('/', authenticateToken, checkPermission('asignar_permisos'), async (req, res) => {
  try {
    const nuevo = await Permiso.query().insert(req.body);
    res.json(nuevo);
  } catch (err) {
    res.status(500).json({ error: 'Error creando permiso' });
  }
});

module.exports = router;
