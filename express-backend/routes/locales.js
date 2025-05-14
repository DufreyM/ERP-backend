const express = require('express');
const router = express.Router();
const Local = require('../models/Local');

router.get('/', async (req, res) => {
    try {
        const locales = await Local.query().select('id', 'nombre');
        res.json(locales);
    } catch (err) {
        console.error('Error obteniendo locales:', err);
        res.status(500).json({ error: 'Error obteniendo locales' });
    }
});

module.exports = router;
