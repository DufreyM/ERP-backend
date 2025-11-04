const Calendario = require('../models/Calendario');
const DocumentoLocal = require('../models/DocumentoLocal');

async function crearNotificacionesDeVencimientoDoc(documento, usuario, localId) {
    try {
        const fechaVencimiento = new Date(documento.vencimiento);
        const fechas = [
            { 
                dias: 7, 
                titulo: `Documento vence pronto: ${documento.nombre}`, 
                mensaje: `El documento "${documento.nombre}" vencerá en una semana.` 
            },
            { 
                dias: 2, 
                titulo: `Alerta documento: ${documento.nombre}`, 
                mensaje: `El documento "${documento.nombre}" vencerá en 2 días.` 
            },
            { 
                dias: 0, 
                titulo: `Documento vencido: ${documento.nombre}`, 
                mensaje: `El documento "${documento.nombre}" vence hoy.` 
            }
        ];

        for (const f of fechas) {
            const fechaNotificacion = new Date(fechaVencimiento);
            fechaNotificacion.setDate(fechaNotificacion.getDate() - f.dias);
            
            await Calendario.query().insert({
                usuario_id: usuario.id,
                local_id: localId,
                tipo_evento_id: 1,
                titulo: f.titulo,
                detalles: f.mensaje,
                estado_id: 1,
                fecha: fechaNotificacion.toISOString()
            });
        }

        console.log(`✅ Notificaciones creadas para documento: ${documento.nombre}`);
    } catch (error) {
        console.error('❌ Error creando notificaciones de vencimiento de documento:', error.message);
        throw error;
    }
}

async function eliminarNotificacionesDeDocumento(documentoId) {
    try {
        const documento = await DocumentoLocal.query().findById(documentoId);
        if (!documento) return;

        await Calendario.query()
            .where('titulo', 'like', `%${documento.nombre}%`)
            .delete();

        console.log(`Notificaciones eliminadas para documento ID: ${documentoId}`);
    } catch (error) {
        console.error('Error eliminando notificaciones de documento:', error.message);
    }
}

module.exports = {
    crearNotificacionesDeVencimientoDoc,
    eliminarNotificacionesDeDocumento
};
