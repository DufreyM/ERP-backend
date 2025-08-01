const validarMovimiento = require('../middlewares/validarMovimiento');

describe('Middleware validarMovimiento', () => {
  let req, res, next;

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  test('tipo de entrada: debe dejar cantidad como positiva', () => {
    req = {
      body: { cantidad: -10, tipo_movimiento_id: 1 }
    };

    validarMovimiento(req, res, next);

    expect(req.body.cantidad).toBe(10);
    expect(next).toHaveBeenCalled();
  });

  test('tipo de salida: debe dejar cantidad como negativa', () => {
    req = {
      body: { cantidad: 15, tipo_movimiento_id: 2 }
    };

    validarMovimiento(req, res, next);

    expect(req.body.cantidad).toBe(-15);
    expect(next).toHaveBeenCalled();
  });

  test('tipo inválido: debe responder 400', () => {
    req = {
      body: { cantidad: 20, tipo_movimiento_id: 999 }
    };

    validarMovimiento(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Tipo de movimiento inválido' });
    expect(next).not.toHaveBeenCalled();
  });
});
