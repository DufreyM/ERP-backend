const express = require('express');
const router = express.Router();
const Calendario = require('../models/Calendario');
const TipoEventoCalendario = require('../models/Tipo_Evento_Calendario');
const knex = require('../database/knexfile').development;

// Obtener eventos filtrados por local y fecha
router.get('/', async (req, res) => {
    try {
        const { start, end, local_id, tipo_evento } = req.query;
        
        let query = Calendario.query()
            .withGraphFetched('[usuario, visitador, estado, local]')
            .whereNull('fecha_eliminado')
            .orderBy('fecha', 'asc');

        if (start && end) {
            query = query.whereBetween('fecha', [start, end]);
        }

        if (local_id) {
            query = query.where('local_id', local_id);
        }

        if (tipo_evento) {
            query = query.where('tipo_evento', tipo_evento);
        }

        const eventos = await query;
        res.json(eventos);
    } catch (err) {
        console.error('Error obteniendo eventos del calendario:', err);
        res.status(500).json({ error: 'Error obteniendo eventos del calendario' });
    }
});

router.get('/tipos-evento', async (req, res) => {
    try {
        const tiposEvento = await TipoEventoCalendario.query();
        
        res.json(tiposEvento);
    } catch (err) {
        console.error('Error obteniendo tipos de evento:', err);
        res.status(500).json({ error: 'Error obteniendo tipos de evento' });
    }
});

// Endpoint específico para notificaciones (productos por expirar)
router.get('/notificaciones', async (req, res) => {
    try {
        const { local_id } = req.query;
        
        const notificaciones = await Calendario.query()
            .withGraphFetched('[usuario, estado, local]')
            .where('local_id', local_id)
            .where('tipo_evento', 'notificacion')
            .whereNull('fecha_eliminado')
            .orderBy('fecha', 'asc');

        res.json(notificaciones);
    } catch (err) {
        console.error('Error obteniendo notificaciones:', err);
        res.status(500).json({ 
            error: 'Error obteniendo notificaciones',
            detalles: err.message 
        });
    }
});

// Endpoint específico para tareas (reabastecimiento)
router.get('/tareas', async (req, res) => {
    try {
        const { local_id } = req.query;
        
        const tareas = await Calendario.query()
            .withGraphFetched('[usuario, estado, local]')
            .where('local_id', local_id)
            .where('tipo_evento', 'tarea')
            .whereNull('fecha_eliminado')
            .orderBy('fecha', 'asc');

        res.json(tareas);
    } catch (err) {
        console.error('Error obteniendo tareas:', err);
        res.status(500).json({ 
            error: 'Error obteniendo tareas',
            detalles: err.message 
        });
    }
});

// Crear evento
router.post('/', async (req, res) => {
    try {
        // Validar según el tipo de evento
        if (req.body.tipo_evento === 'visita_medica' && !req.body.visitador_id) {
            return res.status(400).json({ error: 'Las visitas médicas requieren un visitador' });
        }

        const nuevoEvento = await Calendario.query().insert(req.body);
        res.status(201).json(nuevoEvento);
    } catch (err) {
        console.error('Error creando evento:', err);
        res.status(500).json({ error: 'Error creando evento' });
    }
});

// Actualizar evento
router.put('/:id', async (req, res) => {
    try {
        const updated = await Calendario.query()
            .patchAndFetchById(req.params.id, req.body);
        res.json(updated);
    } catch (err) {
        console.error('Error actualizando evento:', err);
        res.status(500).json({ error: 'Error actualizando evento' });
    }
});

// Eliminar evento (soft delete)
router.delete('/:id', async (req, res) => {
    try {
        await Calendario.query()
            .patchAndFetchById(req.params.id, { 
                fecha_eliminado: new Date().toISOString() 
            });
        res.status(204).send();
    } catch (err) {
        console.error('Error eliminando evento:', err);
        res.status(500).json({ error: 'Error eliminando evento' });
    }
});

module.exports = router;
