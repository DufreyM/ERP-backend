// helpers/resolveCliente.js
const Cliente = require('../models/Cliente');

async function resolveClienteId(trx, { cliente_id, cliente }) {
  // Caso 1: ya viene id
  if (cliente_id) return cliente_id;

  // Caso 2: venta a "Consumidor Final" (Guatemala: "CF")
  if (cliente?.nit && cliente.nit.trim().toUpperCase() === 'CF') {
    return null; // guarda venta sin cliente
  }

  // Caso 3: buscar/crear por NIT
  const nit = cliente?.nit?.trim();
  const nombre = cliente?.nombre?.trim();
  if (!nit || !nombre) throw new Error('Cliente requiere nit y nombre');

  // buscar
  let c = await Cliente.query(trx).findOne({ nit });
  if (!c) {
    c = await Cliente.query(trx)
      .insert({
        nit,
        nombre,
        direccion: cliente.direccion ?? null,
        correo: cliente.correo ?? null
      })
      .onConflict('nit').merge()     // idempotente si ya existe
      .returning('*');
  }
  return c.id;
}

module.exports = { resolveClienteId };
