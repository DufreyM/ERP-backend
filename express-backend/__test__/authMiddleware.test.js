// __test__/authMiddleware.test.js
const jwt = require('jsonwebtoken');
const authenticateToken = require('../middlewares/authMiddleware');

jest.mock('jsonwebtoken');

describe('authMiddleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  test('debe devolver 401 si no hay token', () => {
    authenticateToken(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token no proporcionado' });
  });

  test('debe devolver 403 si el token es inválido', () => {
    req.headers['authorization'] = 'Bearer tokenInvalido';
    jwt.verify.mockImplementation((token, secret, cb) => cb(new Error('Token inválido')));

    authenticateToken(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token inválido o expirado' });
  });

  test('debe llamar next() y establecer req.user si el token es válido', () => {
    req.headers['authorization'] = 'Bearer tokenValido';
    const userPayload = { id: 1, rol_id: 2, local_id: 3 };

    jwt.verify.mockImplementation((token, secret, cb) => cb(null, userPayload));

    authenticateToken(req, res, next);

    expect(req.user).toEqual(userPayload);
    expect(next).toHaveBeenCalled();
  });
});
