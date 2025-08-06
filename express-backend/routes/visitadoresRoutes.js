// Nombre del archivo: visitadorMedicoRoutes.js

// Principales rutas y pequeña descripción de las mismas:
// 1. GET /: Obtiene todos los visitadores médicos con sus relaciones (usuario y proveedor).
// 2. GET /activos: Devuelve los visitadores cuyo usuario tiene status 'activo'.
// 3. GET /:id: Obtiene un visitador médico por su ID con relaciones.
// 4. GET /proveedor/:proveedorId: Obtiene visitadores asociados a un proveedor.
// 5. GET /por-local/:localId: Devuelve visitadores activos relacionados a un local específico.
// 6. GET /search?q=texto: Busca visitadores por nombre o apellido del usuario.
// 7. POST /: Crea un nuevo visitador médico usando insertGraph.
// 8. PUT /:id: Actualiza un visitador médico existente.
// 9. PATCH /:id/deactivate: Cambia el estado del usuario relacionado a 'inactivo'.
// 10. PATCH /:id/activate: Cambia el estado del usuario relacionado a 'activo'.

// Archivos relacionados:
// - models/VisitadorMedico.js: Modelo de datos para los visitadores médicos.
// - models/Usuario.js: Modelo del usuario relacionado al visitador.
// - models/Proveedor.js: Modelo del proveedor relacionado al visitador.
// - app.js o index.js: Punto de entrada donde se importa este router.

// Autor: Leonardo Dufrey Mejía Mejía, 23648
// Última modificación: 06/08/2025

const express = require('express');
const router = express.Router();
const VisitadorMedico = require('../models/VisitadorMedico');
const Usuario = require('../models/Usuario');

// Helper para relaciones por defecto
const RELACIONES = '[usuario, proveedor]';

// Obtener todos los visitadores médicos
router.get('/', async (req, res) => {
  try {
    const visitadores = await VisitadorMedico.query().withGraphFetched(RELACIONES);
    res.json(visitadores);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener visitadores médicos', details: err.message });
  }
});

// Obtener visitadores médicos activos (basado en status del usuario)
router.get('/activos', async (req, res) => {
  try {
    const visitadores = await VisitadorMedico.query()
      .withGraphFetched(RELACIONES)
      .whereExists(
        VisitadorMedico.relatedQuery('usuario').where('status', 'activo')
      );
    res.json(visitadores);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener visitadores activos', details: err.message });
  }
});

// Obtener visitador médico por ID
router.get('/:id', async (req, res) => {
  try {
    const visitador = await VisitadorMedico.query()
      .findById(req.params.id)
      .withGraphFetched(RELACIONES);

    if (!visitador) {
      return res.status(404).json({ error: 'Visitador no encontrado' });
    }

    res.json(visitador);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener visitador médico', details: err.message });
  }
});

// Obtener visitadores por proveedor
router.get('/proveedor/:proveedorId', async (req, res) => {
  try {
    const visitadores = await VisitadorMedico.query()
      .where('proveedor_id', req.params.proveedorId)
      .withGraphFetched(RELACIONES);
    res.json(visitadores);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener visitadores por proveedor', details: err.message });
  }
});

// Obtener visitadores médicos por local con status activo
router.get('/por-local/:localId', async (req, res) => {
  try {
    const visitadores = await VisitadorMedico.query()
      .withGraphFetched(RELACIONES)
      .whereExists(
        VisitadorMedico.relatedQuery('usuario')
          .where('id_local', req.params.localId)
          .andWhere('status', 'activo')
      );

    const formatted = visitadores.map(v => ({
      id: v.id,
      nombre: `${v.usuario?.nombre || ''} ${v.usuario?.apellidos || ''}`.trim()
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener visitadores por local', details: err.message });
  }
});

// Buscar visitadores por nombre o apellidos del usuario
router.get('/search', async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: 'Debe enviar un parámetro de búsqueda ?q=' });

    const visitadores = await VisitadorMedico.query()
      .withGraphFetched(RELACIONES)
      .whereExists(
        VisitadorMedico.relatedQuery('usuario')
          .where('nombre', 'like', `%${query}%`)
          .orWhere('apellidos', 'like', `%${query}%`)
      );

    res.json(visitadores);
  } catch (err) {
    res.status(500).json({ error: 'Error al buscar visitadores', details: err.message });
  }
});

// Crear nuevo visitador médico
router.post('/', async (req, res) => {
  try {
    const nuevo = await VisitadorMedico.query().insertGraph(req.body);
    res.status(201).json(nuevo);
  } catch (err) {
    res.status(400).json({ error: 'Error al crear visitador médico', details: err.message });
  }
});

// Actualizar visitador médico
router.put('/:id', async (req, res) => {
  try {
    const actualizado = await VisitadorMedico.query().patchAndFetchById(req.params.id, req.body);
    if (!actualizado) return res.status(404).json({ error: 'Visitador no encontrado' });
    res.json(actualizado);
  } catch (err) {
    res.status(400).json({ error: 'Error al actualizar visitador médico', details: err.message });
  }
});

// Activar/Desactivar visitador (usuario.status)
async function cambiarEstadoUsuario(req, res, estado) {
  try {
    const visitador = await VisitadorMedico.query()
      .findById(req.params.id)
      .withGraphFetched('usuario');

    if (!visitador) return res.status(404).json({ error: 'Visitador no encontrado' });

    await Usuario.query().patch({ status: estado }).where('id', visitador.usuario_id);

    res.json({ message: `Visitador ${estado === 'activo' ? 'activado' : 'desactivado'}` });
  } catch (err) {
    res.status(500).json({ error: `Error al cambiar estado a ${estado}`, details: err.message });
  }
}

router.patch('/:id/deactivate', (req, res) => cambiarEstadoUsuario(req, res, 'inactivo'));
router.patch('/:id/activate', (req, res) => cambiarEstadoUsuario(req, res, 'activo'));

module.exports = router;
