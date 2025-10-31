// express-backend\routes\permissionRouter.js
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

// Obtener permiso por ID
router.get('/:id', authenticateToken, checkPermission('ver_permisos'), async (req, res) => {
  try {
    const permiso = await Permiso.query()
      .findById(req.params.id)
      .withGraphFetched('modulo');
    
    if (!permiso) {
      return res.status(404).json({ error: 'Permiso no encontrado' });
    }
    
    res.json(permiso);
  } catch (err) {
    res.status(500).json({ error: 'Error obteniendo permiso' });
  }
});

// Crear permiso
router.post('/', authenticateToken, checkPermission('crear_permiso'), async (req, res) => {
  try {
    const nuevo = await Permiso.query().insert(req.body);
    res.status(201).json(nuevo);
  } catch (err) {
    res.status(500).json({ error: 'Error creando permiso' });
  }
});

// Actualizar permiso
router.put('/:id', authenticateToken, checkPermission('editar_permiso'), async (req, res) => {
  try {
    const actualizado = await Permiso.query()
      .patchAndFetchById(req.params.id, req.body);
    
    if (!actualizado) {
      return res.status(404).json({ error: 'Permiso no encontrado' });
    }
    
    res.json(actualizado);
  } catch (err) {
    res.status(500).json({ error: 'Error actualizando permiso' });
  }
});

// Eliminar permiso
router.delete('/:id', authenticateToken, checkPermission('eliminar_permiso'), async (req, res) => {
  try {
    const eliminados = await Permiso.query().deleteById(req.params.id);
    
    if (eliminados === 0) {
      return res.status(404).json({ error: 'Permiso no encontrado' });
    }
    
    res.json({ message: 'Permiso eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error eliminando permiso' });
  }
});

// Obtener permisos por módulo
router.get('/modulo/:moduloId', authenticateToken, checkPermission('ver_permisos'), async (req, res) => {
  try {
    const permisos = await Permiso.query()
      .where('modulo_id', req.params.moduloId)
      .withGraphFetched('modulo');
    
    res.json(permisos);
  } catch (err) {
    res.status(500).json({ error: 'Error obteniendo permisos por módulo' });
  }
});

module.exports = router;
