const Permiso = require('../models/Permiso');

async function actualizarPermiso(req, res) {
    try {
        const { id } = req.params;
        const { nombre, descripcion, modulo_id } = req.body;

        const permiso = await Permiso.query().findById(id);
        if (!permiso) return res.status(404).json({ error: 'Permiso no encontrado' });

        await permiso.$query().patch({
        nombre,
        descripcion,
        modulo_id
        });

        res.json({ message: 'Permiso actualizado correctamente', permiso });
    } catch (error) {
        console.error('Error al actualizar permiso:', error);
        res.status(500).json({ error: 'Error interno al actualizar permiso' });
    }
}

module.exports = { actualizarPermiso };
