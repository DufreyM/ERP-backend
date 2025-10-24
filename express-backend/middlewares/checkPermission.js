const Permiso_Rol = require('../models/Permiso_Rol');

module.exports = function checkPermission(nombrePermiso) {
    return async (req, res, next) => {
        try {
            const { rol_id } = req.user;

            if (!rol_id) {
                return res.status(401).json({ error: 'Usuario no autenticado' });
            }

            const permiso = await Permiso_Rol.query()
                .joinRelated('permiso')
                .where('permisos_roles.rol_id', rol_id)
                .andWhere('permiso.nombre', nombrePermiso)
                .first();

            if (!permiso) {
                return res.status(403).json({ 
                    error: `No tienes permiso para: ${nombrePermiso}` 
                });
            }

            next();
        } catch (err) {
            console.error('Error en checkPermission:', err);
            res.status(500).json({ error: 'Error verificando permisos.' });
        }
    };
};
