const jwt = require('jsonwebtoken');

module.exports = function authenticateToken(req, res, next) {
  const auth = req.headers['authorization'] || '';
  const [scheme, token] = auth.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Token no proporcionado' }); // Cambiado para coincidir con la prueba
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: payload.id,
      email: payload.email,
      rol_id: payload.rol_id,
      local_id: payload.local_id
    };

    return next();
  } catch (err) {
    return res.status(403).json({ error: 'Token inválido o expirado' });
  }
};