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
            tipo_evento_id: 1,
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

async function crearNotificacionesDeVencimientoDocumento(documento, usuario, localId) {
    try {
        if (!documento.vencimiento) {
            console.log('Documento sin fecha de vencimiento, no se crean notificaciones');
            return;
        }

        const fechaVencimiento = new Date(documento.vencimiento);
        const fechas = [
            { dias: 7, titulo: `Vence pronto: ${documento.nombre}`, mensaje: `El documento ${documento.nombre} vencerá en una semana.` },
            { dias: 2, titulo: `Alerta: ${documento.nombre}`, mensaje: `El documento ${documento.nombre} vencerá en 2 días.` },
            { dias: 0, titulo: `Vencido: ${documento.nombre}`, mensaje: `El documento ${documento.nombre} vence hoy.` }
        ];

        for (const f of fechas) {
            const fecha = new Date(fechaVencimiento);
            fecha.setDate(fecha.getDate() - f.dias);
            await Calendario.query().insert({
                usuario_id: usuario.id,
                local_id: localId,
                tipo_evento_id: 1,
                titulo: f.titulo,
                detalles: f.mensaje,
                estado_id: 1,
                fecha: fecha.toISOString()
            });
        }

        console.log(`Notificaciones creadas para documento ${documento.nombre}`);
    } catch (error) {
        console.error('Error creando notificaciones de vencimiento para documento:', error.message);
    }
}

module.exports = { crearNotificacionesDeVencimiento, crearNotificacionesDeVencimientoDocumento };
