module.exports = function authorizeRole(rolesPermitidos) {
    return (req, res, next) => {
        const usuario = req.user;

        if (!usuario) {
            return res.status(401).json({ error: 'No autenticado' });
        }

        if (!rolesPermitidos.includes(usuario.rol_id)) {
            return res.status(403).json({ error: 'No tienes permiso para esta acción' });
        }

        next();
    };
};
