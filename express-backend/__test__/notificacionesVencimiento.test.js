// Mockear modelo antes de requerir el módulo bajo prueba
jest.mock('../models/Calendario');

const Calendario = require('../models/Calendario');
const crearNotificacionesDeVencimiento = require('../services/notificacionesVencimiento');

describe('crearNotificacionesDeVencimiento', () => {
  let consoleLogSpy;
  let consoleErrorSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  test('crea 3 notificaciones con las fechas correctas', async () => {
    const insertMock = jest.fn().mockResolvedValue({});
    const queryChain = { insert: insertMock };
    Calendario.query.mockReturnValue(queryChain);

    const producto = { nombre: 'Jugo' };
    const lote = { fecha_vencimiento: '2025-12-10T00:00:00.000Z', lote: 'L-123' };
    const usuario = { id: 42 };
    const localId = 7;

    // Llamada
    await crearNotificacionesDeVencimiento(producto, lote, usuario, localId);

    expect(Calendario.query).toHaveBeenCalledTimes(3);
    expect(insertMock).toHaveBeenCalledTimes(3);

    // Comprobamos los payloads (fechas calculadas restando 7,2,0 días)
    const fechaVenc = new Date(lote.fecha_vencimiento);

    const expected = [
      { dias: 7, titulo: `Vence pronto: ${producto.nombre}`, mensaje: `El producto ${producto.nombre} vencerá en una semana (Lote ${lote.lote}).` },
      { dias: 2, titulo: `Alerta: ${producto.nombre}`, mensaje: `El producto ${producto.nombre} vencerá en 2 días (Lote ${lote.lote}).` },
      { dias: 0, titulo: `Vencido: ${producto.nombre}`, mensaje: `El producto ${producto.nombre} vence hoy (Lote ${lote.lote}).` }
    ];

    // Verificamos cada llamada con el objeto esperado (usuario_id, local_id, tipo_evento_id, título, detalles, estado, fecha)
    for (let i = 0; i < expected.length; i++) {
      const e = expected[i];
      const f = new Date(fechaVenc);
      f.setDate(f.getDate() - e.dias);
      const expectedPayload = {
        usuario_id: usuario.id,
        local_id: localId,
        tipo_evento_id: 2,
        titulo: e.titulo,
        detalles: e.mensaje,
        estado_id: 1,
        fecha: f.toISOString()
      };
      expect(insertMock).toHaveBeenNthCalledWith(i + 1, expectedPayload);
    }

    expect(consoleLogSpy).toHaveBeenCalledWith(
      `Notificaciones creadas para producto ${producto.nombre}, lote ${lote.lote}`
    );

    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  test('captura errores de inserción y los registra en console.error', async () => {
    const insert1 = jest.fn().mockResolvedValue({});
    const insert2 = jest.fn().mockRejectedValue(new Error('Insert failed'));
    const insert3 = jest.fn().mockResolvedValue({});

    Calendario.query
      .mockReturnValueOnce({ insert: insert1 })
      .mockReturnValueOnce({ insert: insert2 })
      .mockReturnValueOnce({ insert: insert3 });

    const producto = { nombre: 'Leche' };
    const lote = { fecha_vencimiento: '2025-06-15T00:00:00.000Z', lote: 'L-999' };
    const usuario = { id: 9 };
    const localId = 4;

    await crearNotificacionesDeVencimiento(producto, lote, usuario, localId);

    expect(insert1).toHaveBeenCalledTimes(1);
    expect(insert2).toHaveBeenCalledTimes(1);
  
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error creando notificaciones de vencimiento:', 'Insert failed');

    expect(consoleLogSpy).not.toHaveBeenCalled();
  });
});
