const express = require('express');
const router = express.Router();
const Calendario = require('../models/Calendario');
const knex = require('../database/knexfile').development;

router.get('/', async (req, res) => {
    try {
        // Obtener parámetros de filtrado si existen
        const { start, end, usuario_id } = req.query;
        
        let query = Calendario.query()
            .withGraphFetched('[usuario, visitador, estado, local]')
            .orderBy('fecha', 'asc');

        if (start && end) {
            query = query.whereBetween('fecha', [start, end]);
        }

        if (usuario_id) {
            query = query.where('usuario_id', usuario_id);
        }

        const eventos = await query;
        res.json(eventos);
    } catch (err) {
        console.error('Error obteniendo eventos del calendario:', err);
        res.status(500).json({ error: 'Error obteniendo eventos del calendario' });
    }
});

router.post('/', async (req, res) => {
    try {
        const nuevoEvento = await Calendario.query().insert(req.body);
        res.status(201).json(nuevoEvento);
    } catch (err) {
        console.error('Error creando evento:', err);
        res.status(500).json({ error: 'Error creando evento' });
    }
});

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

router.delete('/:id', async (req, res) => {
    try {
        await Calendario.query().deleteById(req.params.id);
        res.status(204).send();
    } catch (err) {
        console.error('Error eliminando evento:', err);
        res.status(500).json({ error: 'Error eliminando evento' });
    }
});

module.exports = router;

