const express = require('express');
const router = express.Router();
const Rol = require('../models/Rol');

router.get('/', async (req, res) => {
    try {
        const roles = await Rol.query().select('id', 'nombre');
        res.json(roles);
    } catch (err) {
        console.error('Error obteniendo roles:', err);
        res.status(500).json({ error: 'Error obteniendo roles' });
    }
});

module.exports = router;
