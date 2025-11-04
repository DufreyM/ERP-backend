const Calendario = require('../models/Calendario');

async function crearNotificacionesDeVencimiento(producto, lote, usuario, localId) {
    try {
        const fechaVencimiento = new Date(lote.fecha_vencimiento);
        const fechas = [
        { dias: 7, titulo: `Vence pronto: ${producto.nombre}`, mensaje: `El producto ${producto.nombre} vencerá en una semana (Lote ${lote.lote}).` },
        { dias: 2, titulo: `Alerta: ${producto.nombre}`, mensaje: `El producto ${producto.nombre} vencerá en 2 días (Lote ${lote.lote}).` },
        { dias: 0, titulo: `Vencido: ${producto.nombre}`, mensaje: `El producto ${producto.nombre} vence hoy (Lote ${lote.lote}).` }
        ];

        for (const f of fechas) {
        const fecha = new Date(fechaVencimiento);
        fecha.setDate(fecha.getDate() - f.dias);
        await Calendario.query().insert({
            usuario_id: usuario.id,
            local_id: localId,
            tipo_evento_id: 2,
            titulo: f.titulo,
            detalles: f.mensaje,
            estado_id: 1,
            fecha: fecha.toISOString()
        });
        }

        console.log(`Notificaciones creadas para producto ${producto.nombre}, lote ${lote.lote}`);
    } catch (error) {
        console.error('Error creando notificaciones de vencimiento:', error.message);
    }
}

module.exports = crearNotificacionesDeVencimiento;
