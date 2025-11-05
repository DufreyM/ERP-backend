// __test__/notificacionesVencimientoDoc.test.js

// Mocks deben declararse antes de requerir el módulo bajo prueba
jest.mock('../models/Calendario');
jest.mock('../models/DocumentoLocal');

const Calendario = require('../models/Calendario');
const DocumentoLocal = require('../models/DocumentoLocal');
const {
  crearNotificacionesDeVencimientoDoc,
  eliminarNotificacionesDeDocumento
} = require('../services/notificacionesVencimientoDoc');

describe('notificacionesVencimientoDoc', () => {
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

  describe('crearNotificacionesDeVencimientoDoc', () => {
    test('crea 3 notificaciones con fechas correctas y hace console.log', async () => {
      const insertMock = jest.fn().mockResolvedValue({});
      // Hacemos que cada llamada a Calendario.query() retorne una chain con insert
      Calendario.query.mockReturnValue({ insert: insertMock });

      const documento = { nombre: 'Poliza', vencimiento: '2026-01-10T00:00:00.000Z' };
      const usuario = { id: 55 };
      const localId = 2;

      await crearNotificacionesDeVencimientoDoc(documento, usuario, localId);

      // Debieron llamarse 3 inserts
      expect(Calendario.query).toHaveBeenCalledTimes(3);
      expect(insertMock).toHaveBeenCalledTimes(3);

      const fechaVenc = new Date(documento.vencimiento);

      const expected = [
        { dias: 7, titulo: `Documento vence pronto: ${documento.nombre}`, mensaje: `El documento "${documento.nombre}" vencerá en una semana.` },
        { dias: 2, titulo: `Alerta documento: ${documento.nombre}`, mensaje: `El documento "${documento.nombre}" vencerá en 2 días.` },
        { dias: 0, titulo: `Documento vencido: ${documento.nombre}`, mensaje: `El documento "${documento.nombre}" vence hoy.` }
      ];

      for (let i = 0; i < expected.length; i++) {
        const e = expected[i];
        const d = new Date(fechaVenc);
        d.setDate(d.getDate() - e.dias);
        const expectedPayload = {
          usuario_id: usuario.id,
          local_id: localId,
          tipo_evento_id: 2,
          titulo: e.titulo,
          detalles: e.mensaje,
          estado_id: 1,
          fecha: d.toISOString()
        };
        expect(insertMock).toHaveBeenNthCalledWith(i + 1, expectedPayload);
      }

      expect(consoleLogSpy).toHaveBeenCalledWith(`Notificaciones creadas para documento: ${documento.nombre}`);
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    test('si insert falla, registra error y relanza', async () => {
      // Hacemos que la primera insert resuelva ok, la segunda rechace
      const insert1 = jest.fn().mockResolvedValue({});
      const insert2 = jest.fn().mockRejectedValue(new Error('Insert failed'));
      const insert3 = jest.fn().mockResolvedValue({});

      Calendario.query
        .mockReturnValueOnce({ insert: insert1 })
        .mockReturnValueOnce({ insert: insert2 })
        .mockReturnValueOnce({ insert: insert3 });

      const documento = { nombre: 'Contrato', vencimiento: '2026-05-20T00:00:00.000Z' };
      const usuario = { id: 7 };
      const localId = 3;

      await expect(
        crearNotificacionesDeVencimientoDoc(documento, usuario, localId)
      ).rejects.toThrow('Insert failed');

      // Se intentaron las dos primeras inserciones (la segunda rebotó)
      expect(insert1).toHaveBeenCalledTimes(1);
      expect(insert2).toHaveBeenCalledTimes(1);
      // Como la función re-lanza tras el error, la tercera insert probablemente no se ejecutó
      // (la implementación captura y relanza al detectar el error en el try).
      // Aseguramos que se haya loggeado el error con el mensaje adecuado
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error creando notificaciones de vencimiento de documento:', 'Insert failed');
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });
  });

  describe('eliminarNotificacionesDeDocumento', () => {
    test('no hace nada si el documento no existe', async () => {
      DocumentoLocal.query = jest.fn().mockReturnValue({
        findById: jest.fn().mockResolvedValue(null)
      });

      const deleteSpy = jest.fn();
      Calendario.query = jest.fn().mockReturnValue({
        where: jest.fn().mockReturnThis(),
        delete: deleteSpy
      });

      await eliminarNotificacionesDeDocumento(9999);

      // findById fue llamado, pero no se llamó a delete
      expect(DocumentoLocal.query().findById).toHaveBeenCalledWith(9999);
      expect(deleteSpy).not.toHaveBeenCalled();
      expect(consoleLogSpy).not.toHaveBeenCalled();
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    test('elimina notificaciones cuando documento existe y hace console.log', async () => {
      const documento = { id: 77, nombre: 'Seguro Vehicular' };
      DocumentoLocal.query = jest.fn().mockReturnValue({
        findById: jest.fn().mockResolvedValue(documento)
      });

      const deleteMock = jest.fn().mockResolvedValue(3);
      const whereMock = jest.fn().mockReturnValue({ delete: deleteMock });
      Calendario.query = jest.fn().mockReturnValue({ where: whereMock });

      await eliminarNotificacionesDeDocumento(77);

      expect(DocumentoLocal.query().findById).toHaveBeenCalledWith(77);
      // verificamos que where fue llamado con la cláusula que contiene el nombre del doc
      expect(whereMock).toHaveBeenCalledWith('titulo', 'like', `%${documento.nombre}%`);
      expect(deleteMock).toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalledWith(`Notificaciones eliminadas para documento ID: 77`);
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    test('captura y loggea errores si findById lanza excepción', async () => {
      const err = new Error('DB failure');
      DocumentoLocal.query = jest.fn().mockReturnValue({
        findById: jest.fn().mockRejectedValue(err)
      });

      await eliminarNotificacionesDeDocumento(123);

      expect(DocumentoLocal.query().findById).toHaveBeenCalledWith(123);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error eliminando notificaciones de documento:', 'DB failure');
    });
  });
});
