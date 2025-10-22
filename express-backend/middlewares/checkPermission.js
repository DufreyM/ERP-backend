const Permiso_Rol = require('../models/Permiso_Rol');
const Permiso = require('../models/Permiso');
const Modulo = require('../models/Modulo');

module.exports = function checkPermission(nombreModulo) {
    return async (req, res, next) => {
        try {
        const { rol_id } = req.user;

        const permiso = await Permiso_Rol.query()
            .joinRelated('permiso')
            .where('permisos_roles.rol_id', rol_id)
            .andWhere('permiso.nombre', nombreModulo)
            .first();

        if (!permiso) {
            return res.status(403).json({ error: 'No tienes permiso para acceder a este módulo.' });
        }

        next();
        } catch (err) {
        console.error('Error en checkPermission:', err);
        res.status(500).json({ error: 'Error verificando permisos.' });
        }
    };
};
