const Inventario = require('../models/Inventario');

async function registrarMovimiento(data) {
  const movimiento = await Inventario.query().insert({
    ...data,
    fecha: new Date().toISOString(),
  });

  return movimiento;
}
