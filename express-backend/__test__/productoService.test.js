// __test__/productoService.test.js
// MOCK debe declararse antes de requerir el servicio
jest.mock('../models/Producto');

const Producto = require('../models/Producto');
const productoService = require('../services/productoService');

describe('productoService', () => {
  beforeEach(() => {
    // Resetea TODO: implementaciones, valores retornados, llamadas, etc.
    jest.resetAllMocks();
  });

  describe('obtenerProductosConStock', () => {
    test('normaliza campos: convierte stock a número y usa precio_a_cobrar cuando es > 0', async () => {
      const rawProducts = [
        {
          codigo: 1,
          nombre: 'Producto A',
          presentacion: 'Botella',
          precioventa: '8.50',
          stock_actual: '5',
          precio_a_cobrar: '10.00',
          fecha_vencimiento_mas_cercana: '2026-01-01',
          proveedor: { id: 2, nombre: 'Prov A' }
        },
        {
          codigo: 2,
          nombre: 'Producto B',
          presentacion: 'Caja',
          precioventa: '15.00',
          stock_actual: null,
          precio_a_cobrar: '0',
          fecha_vencimiento_mas_cercana: null,
          proveedor: { id: 3, nombre: 'Prov B' }
        }
      ];

      const chain = {
        select: jest.fn().mockReturnThis(),
        withGraphFetched: jest.fn().mockReturnThis(),
        modifyGraph: jest.fn().mockReturnThis(),
        orderByRaw: jest.fn().mockResolvedValue(rawProducts)
      };
      Producto.query.mockReturnValue(chain);

      const res = await productoService.obtenerProductosConStock();

      expect(Array.isArray(res)).toBe(true);
      expect(res).toHaveLength(2);

      const pA = res.find(p => p.codigo === 1);
      expect(pA.stock_actual).toBe(5);
      expect(pA.precio_a_cobrar).toBeCloseTo(10.00);
      expect(pA.precioventa).toBeCloseTo(10.00);
      expect(pA.precio).toBeCloseTo(10.00);

      const pB = res.find(p => p.codigo === 2);
      expect(pB.stock_actual).toBe(0);
      expect(pB.precio_a_cobrar).toBe(0);
      expect(pB.precioventa).toBeCloseTo(15.00);
      expect(pB.precio).toBeCloseTo(15.00);
    });

    test('pasa local_id al raw SQL (mock verifica que la cadena se ejecutó)', async () => {
      const products = [{ codigo: 10, nombre: 'X', precioventa: '5', stock_actual: '1', precio_a_cobrar: '0', fecha_vencimiento_mas_cercana: null }];
      const chain = {
        select: jest.fn().mockReturnThis(),
        withGraphFetched: jest.fn().mockReturnThis(),
        modifyGraph: jest.fn().mockReturnThis(),
        orderByRaw: jest.fn().mockResolvedValue(products)
      };
      Producto.query.mockReturnValue(chain);

      const res = await productoService.obtenerProductosConStock(3);
      expect(Producto.query).toHaveBeenCalled();
      expect(res[0].stock_actual).toBe(1);
      expect(res[0].precio).toBeCloseTo(5);
    });
  });

  describe('buscarProductosConStock', () => {
    test('filtra por stock>0 y formatea salida correctamente', async () => {
      // En lugar de espiar la función interna, mockeamos Producto.query para que
      // obtenerProductosConStock devuelva exactamente estos objetos.
      const productsFromQuery = [
        // ya en la forma que obtiene obtenerProductosConStock (antes de normalizar)
        { codigo: 100, nombre: 'Manzana', presentacion: 'Kg', precioventa: '4.5', stock_actual: '10', precio_a_cobrar: '0', fecha_vencimiento_mas_cercana: '2026-02-01' },
        { codigo: 200, nombre: 'Pera', presentacion: 'Kg', precioventa: '3.5', stock_actual: '0', precio_a_cobrar: '0', fecha_vencimiento_mas_cercana: '2026-03-01' },
        { codigo: 300, nombre: 'Manzana Verde', presentacion: 'Kg', precioventa: '4.0', stock_actual: '2', precio_a_cobrar: '5.0', fecha_vencimiento_mas_cercana: '2026-01-15' }
      ];

      const chain = {
        select: jest.fn().mockReturnThis(),
        withGraphFetched: jest.fn().mockReturnThis(),
        modifyGraph: jest.fn().mockReturnThis(),
        orderByRaw: jest.fn().mockResolvedValue(productsFromQuery)
      };
      Producto.query.mockReturnValue(chain);

      const res = await productoService.buscarProductosConStock({ query: '', local_id: null });

      // Solo productos con stock_actual > 0 -> 100 y 300
      expect(res).toHaveLength(2);

      const item100 = res.find(r => r.id === 100);
      expect(item100.nombre).toBe('Manzana');
      expect(item100.precio).toBe(4.5);
      expect(item100.stock).toBe(10);

      const item300 = res.find(r => r.id === 300);
      expect(item300.precio).toBe(5.0);
      expect(item300.stock).toBe(2);
    });

    test('aplica filtro por query (nombre o codigo)', async () => {
      const productsFromQuery = [
        { codigo: 100, nombre: 'Manzana', presentacion: 'Kg', precioventa: '4.5', stock_actual: '10', precio_a_cobrar: '0', fecha_vencimiento_mas_cercana: '2026-02-01' },
        { codigo: 200, nombre: 'Pera', presentacion: 'Kg', precioventa: '3.5', stock_actual: '5', precio_a_cobrar: '0', fecha_vencimiento_mas_cercana: '2026-03-01' },
        { codigo: 3001, nombre: 'Kiwi', presentacion: 'Ud', precioventa: '2.0', stock_actual: '2', precio_a_cobrar: '0', fecha_vencimiento_mas_cercana: null }
      ];

      const chain = {
        select: jest.fn().mockReturnThis(),
        withGraphFetched: jest.fn().mockReturnThis(),
        modifyGraph: jest.fn().mockReturnThis(),
        orderByRaw: jest.fn().mockResolvedValue(productsFromQuery)
      };
      Producto.query.mockReturnValue(chain);

      let res = await productoService.buscarProductosConStock({ query: 'man', local_id: null });
      expect(res).toHaveLength(1);
      expect(res[0].nombre).toBe('Manzana');

      res = await productoService.buscarProductosConStock({ query: '3001', local_id: null });
      expect(res).toHaveLength(1);
      expect(res[0].id).toBe(3001);
    });
  });
});
