module.exports = function validarMovimiento(req, res, next) {
  const { cantidad, tipo_movimiento_id } = req.body;

  // Entrada = positivo, salida = negativo
  const tipoEntrada = [1]; 
  const tipoSalida = [2]; 

  if (tipoEntrada.includes(tipo_movimiento_id)) {
    req.body.cantidad = Math.abs(cantidad);
  } else if (tipoSalida.includes(tipo_movimiento_id)) {
    req.body.cantidad = -Math.abs(cantidad);
  } else {
    return res.status(400).json({ error: 'Tipo de movimiento inválido' });
  }

  next();
};
