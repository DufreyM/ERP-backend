const express = require('express');
const router = express.Router();
const Calendario = require('../models/Calendario');
const Estado_Calendario = require('../models/Estado_Calendario');
const TipoEventoCalendario = require('../models/Tipo_Evento_Calendario');
const knex = require('../database/knexfile').development;
const authenticateToken = require('../middlewares/authMiddleware');

// Obtener eventos filtrados por local y fecha
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { start, end, local_id, tipo_evento } = req.query;
        const usuario = req.user;
        
        let query = Calendario.query()
            .withGraphFetched('[usuario, visitador, estado, local]')
            .whereNull('fecha_eliminado')
            .orderBy('fecha', 'asc');

        if (start && end) {
            query = query.whereBetween('fecha', [start, end]);
        }

        if (tipo_evento) {
            query = query.where('tipo_evento', tipo_evento);
        }

        // Filtrado por local
        if (usuario.rol_id !== 1) {
            query = query.where('local_id', usuario.local_id);
        } else if (local_id) {
            query = query.where('local_id', local_id);
        }

        // Filtrado por usuario (si no es admin)
        if (usuario.rol_id !== 1) {
            query = query.where('usuario_id', usuario.id);
        }

        const eventos = await query;
        res.json(eventos);
    } catch (err) {
        console.error('Error obteniendo eventos del calendario:', err);
        res.status(500).json({ 
            error: 'Error obteniendo eventos del calendario',
            detalles: err.message
        });
    }
});

// Nuevo endpoint para obtener estados de calendario
router.get('/estados', authenticateToken, async (req, res) => {
    try {
        const estados = await Estado_Calendario.query();
        res.json(estados);
    } catch (err) {
        console.error('Error obteniendo estados de calendario:', err);
        res.status(500).json({ 
            error: 'Error obteniendo estados de calendario',
            detalles: err.message
        });
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
router.get('/notificaciones', authenticateToken, async (req, res) => {
    try {
        const { local_id } = req.query;
        const usuario = req.user;
        
        let query = Calendario.query()
            .withGraphFetched('[usuario, estado, local]')
            .where('tipo_evento', 'notificacion')
            .whereNull('fecha_eliminado')
            .orderBy('fecha', 'asc');

        // Si no es admin, filtrar por su local_id
        if (usuario.rol_id !== 1) {
            query = query.where('local_id', usuario.local_id);
        } else if (local_id) {
            // Admin puede filtrar por local específico si lo indica
            query = query.where('local_id', local_id);
        }

        // Si no es admin, solo mostrar sus propias notificaciones
        if (usuario.rol_id !== 1) {
            query = query.where('usuario_id', usuario.id);
        }

        const notificaciones = await query;
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
router.get('/tareas', authenticateToken, async (req, res) => {
    try {
        const { local_id } = req.query;
        const usuario = req.user;
        
        let query = Calendario.query()
            .withGraphFetched('[usuario, estado, local]')
            .where('tipo_evento', 'tarea')
            .whereNull('fecha_eliminado')
            .orderBy('fecha', 'asc');

        // Si no es admin, filtrar por su local_id
        if (usuario.rol_id !== 1) {
            query = query.where('local_id', usuario.local_id);
        } else if (local_id) {
            // Admin puede filtrar por local específico si lo indica
            query = query.where('local_id', local_id);
        }

        // Si no es admin, solo mostrar sus propias tareas
        if (usuario.rol_id !== 1) {
            query = query.where('usuario_id', usuario.id);
        }

        const tareas = await query;
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
router.post('/', authenticateToken, async (req, res) => {
    try {
        const usuario = req.user;
        
        // Validar según el tipo de evento
        if (req.body.tipo_evento === 'visita_medica' && !req.body.visitador_id) {
            return res.status(400).json({ error: 'Las visitas médicas requieren un visitador' });
        }

        // Asignar automáticamente usuario_id y local_id (a menos que sea admin y especifique otros)
        const eventoData = {
            ...req.body,
            usuario_id: usuario.rol_id === 1 ? req.body.usuario_id || usuario.id : usuario.id,
            local_id: usuario.rol_id === 1 ? req.body.local_id || usuario.local_id : usuario.local_id
        };

        const nuevoEvento = await Calendario.query().insert(eventoData);
        res.status(201).json(nuevoEvento);
    } catch (err) {
        console.error('Error creando evento:', err);
        res.status(500).json({ 
            error: 'Error creando evento',
            detalles: err.message
        });
    }
});

// Actualizar evento
router.put('/:id', authenticateToken, async (req, res) => {
        try {
            const usuario = req.user;
            const evento = await Calendario.query().findById(req.params.id);
            
            // Verificar permisos
            if (usuario.rol_id !== 1 && evento.usuario_id !== usuario.id) {
                return res.status(403).json({ error: 'No tienes permiso para actualizar este evento' });
            }

            const updated = await Calendario.query()
                .patchAndFetchById(req.params.id, req.body);
            res.json(updated);
        } catch (err) {
            console.error('Error actualizando evento:', err);
            res.status(500).json({ error: 'Error actualizando evento' });
        }
    });

    // Ruta PUT para marcado como eliminado
    router.put('/:id/marcar-eliminado', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const usuario = req.user;

        // 1. Verificar que el evento existe
        const evento = await Calendario.query().findById(id);
        if (!evento) {
        return res.status(404).json({ error: 'Evento no encontrado' });
        }

        // 2. Verificar permisos
        if (usuario.rol_id !== 1 && evento.usuario_id !== usuario.id) {
        return res.status(403).json({ error: 'No autorizado' });
        }

        // 3. Actualizar SOLO la fecha_eliminado
        const updated = await Calendario.query()
        .patchAndFetchById(id, {
            fecha_eliminado: new Date().toISOString()
        });

        // 4. Verificar que se actualizó correctamente
        if (!updated.fecha_eliminado) {
        throw new Error('No se pudo marcar como eliminado');
        }

        res.json({ 
        success: true,
        message: 'Evento marcado como eliminado',
        data: updated
        });

    } catch (error) {
        console.error('Error en marcar-eliminado:', error);
        res.status(500).json({
        error: 'Error al marcar el evento como eliminado',
        details: error.message
        });
    }

    // Obtener eventos eliminados
    router.get('/eliminados', authenticateToken, async (req, res) => {
        try {
            const usuario = req.user;
            
            let query = Calendario.query()
                .withGraphFetched('[usuario, visitador, estado, local]')
                .whereNotNull('fecha_eliminado')
                .orderBy('fecha_eliminado', 'desc');

            // Filtrado por local
            if (usuario.rol_id !== 1) {
                query = query.where('local_id', usuario.local_id);
            }

            // Filtrado por usuario (si no es admin)
            if (usuario.rol_id !== 1) {
                query = query.where('usuario_id', usuario.id);
            }

            const eventosEliminados = await query;
            res.json(eventosEliminados);
        } catch (err) {
            console.error('Error obteniendo eventos eliminados:', err);
            res.status(500).json({ 
                error: 'Error obteniendo eventos eliminados',
                detalles: err.message
            });
        }
    });
});

module.exports = router;
