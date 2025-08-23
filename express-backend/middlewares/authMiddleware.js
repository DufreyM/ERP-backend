// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');

module.exports = function authenticateToken(req, res, next) {
  const auth = req.headers['authorization'] || '';
  const [scheme, token] = auth.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Token no proporcionado o esquema inválido' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // Asegúrate que /login firme { id, email, rol_id, local_id }
    req.user = {
      id: payload.id,
      email: payload.email,
      rol_id: payload.rol_id,
      local_id: payload.local_id
    };

    // Diagnóstico temporal (comenta en producción)
    // console.log('auth user =>', req.user);

    return next();
  } catch (err) {
    return res.status(403).json({ error: 'Token inválido o expirado' });
  }
};
