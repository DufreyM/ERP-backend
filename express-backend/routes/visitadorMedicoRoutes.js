// routes/visitadorMedicoRoutes.js
const express = require('express');
const router = express.Router();
const VisitadorMedico = require('../models/VisitadorMedico');
const Usuario = require('../models/Usuario');

// Obtener todos los visitadores médicos con sus relaciones
router.get('/', async (req, res) => {
    try {
        const visitadores = await VisitadorMedico.query()
        .withGraphFetched('[usuario, proveedor]');
        res.json(visitadores);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Obtener visitadores médicos activos
router.get('/activos', async (req, res) => {
    try {
        const visitadores = await VisitadorMedico.query()
        .withGraphFetched('[usuario, proveedor]')
        .where('usuario.status', 'activo');
        res.json(visitadores);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Crear nuevo visitador médico
router.post('/', async (req, res) => {
    try {
        const visitador = await VisitadorMedico.query()
        .insertGraph(req.body);
        res.status(201).json(visitador);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Actualizar visitador médico
router.put('/:id', async (req, res) => {
    try {
        const updated = await VisitadorMedico.query()
        .patchAndFetchById(req.params.id, req.body);
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Desactivar visitador médico (actualiza el usuario asociado)
router.patch('/:id/deactivate', async (req, res) => {
    try {
        const visitador = await VisitadorMedico.query()
        .findById(req.params.id)
        .withGraphFetched('usuario');
        
        if (!visitador) {
        return res.status(404).json({ error: 'Visitador no encontrado' });
        }
        
        await Usuario.query()
        .patch({ status: 'inactivo' })
        .where('id', visitador.usuario_id);
        
        res.json({ message: 'Visitador médico desactivado' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Reactivar visitador médico
router.patch('/:id/activate', async (req, res) => {
    try {
        const visitador = await VisitadorMedico.query()
        .findById(req.params.id)
        .withGraphFetched('usuario');
        
        if (!visitador) {
        return res.status(404).json({ error: 'Visitador no encontrado' });
        }
        
        await Usuario.query()
        .patch({ status: 'activo' })
        .where('id', visitador.usuario_id);
        
        res.json({ message: 'Visitador médico reactivado' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Obtener visitador médico por ID con relaciones
router.get('/:id', async (req, res) => {
    try {
        const visitador = await VisitadorMedico.query()
        .findById(req.params.id)
        .withGraphFetched('[usuario, proveedor]');
        
        if (!visitador) {
        return res.status(404).json({ error: 'Visitador no encontrado' });
        }
        
        res.json(visitador);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Obtener visitadores por proveedor
router.get('/proveedor/:proveedorId', async (req, res) => {
    try {
        const visitadores = await VisitadorMedico.query()
        .where('proveedor_id', req.params.proveedorId)
        .withGraphFetched('[usuario, proveedor]');
        res.json(visitadores);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Buscar visitadores
router.get('/search', async (req, res) => {
    try {
        const query = req.query.q;
        const visitadores = await VisitadorMedico.query()
        .withGraphFetched('[usuario, proveedor]')
        .where('usuario.nombre', 'like', `%${query}%`)
        .orWhere('usuario.apellidos', 'like', `%${query}%`);
        res.json(visitadores);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/visitadores-medicos/por-local/:localId
router.get('/por-local/:localId', async (req, res) => {
  try {
    const { localId } = req.params;

    const visitadores = await VisitadorMedico.query()
      .withGraphFetched('[usuario, proveedor]')
      .whereExists(
        VisitadorMedico.relatedQuery('usuario')
          .where('id_local', localId)
          .andWhere('status', 'activo')
      );

    const formatted = visitadores.map(v => ({
      id: v.id,
      nombre: `${v.usuario?.nombre || ''} ${v.usuario?.apellidos || ''}`.trim()
    }));

    res.json(formatted);
  } catch (err) {
    console.error('Error obteniendo visitadores por local:', err);
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;