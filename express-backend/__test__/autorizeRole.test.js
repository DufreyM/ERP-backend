const authorizeRole = require('../middlewares/authorizeRole');

describe('authorizeRole middleware', () => {
  let req, res, next;

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  test('debe responder 401 si no hay usuario autenticado', () => {
    req = { user: null };

    const middleware = authorizeRole([1, 2]);
    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'No autenticado' });
    expect(next).not.toHaveBeenCalled();
  });

  test('debe responder 403 si el rol no está permitido', () => {
    req = { user: { id: 5, rol_id: 3 } }; // rol_id no permitido

    const middleware = authorizeRole([1, 2]);
    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'No tienes permiso para esta acción' });
    expect(next).not.toHaveBeenCalled();
  });

  test('debe llamar a next() si el rol está permitido', () => {
    req = { user: { id: 5, rol_id: 2 } }; // rol_id permitido

    const middleware = authorizeRole([1, 2]);
    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});
