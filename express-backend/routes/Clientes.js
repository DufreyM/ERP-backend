const router = require('express').Router();
const Cliente = require('../models/Cliente');
const auth = require('../middlewares/authMiddleware');
const checkPermission = require('../middlewares/checkPermission');

router.use(auth);

// GET /clientes - Obtener TODOS los clientes
router.get('/', checkPermission('ver_clientes'), async (req, res) => {
  try {
    const clientes = await Cliente.query().select('*').orderBy('id', 'desc');
    res.json(clientes);
  } catch (error) {
    console.error('Error en GET /clientes:', error);
    res.status(500).json({ error: 'Error al obtener clientes' });
  }
});

// GET /clientes/buscar?nit=XXXX - Búsqueda específica por NIT
router.get('/buscar', checkPermission('buscar_cliente_nit'), async (req, res) => {
  const { nit } = req.query;
  if (!nit) return res.status(400).json({ error: 'nit requerido' });
  
  try {
    const c = await Cliente.query().findOne({ nit });
    if (!c) return res.status(404).json({ error: 'no encontrado' });
    res.json(c);
  } catch (error) {
    console.error('Error en GET /clientes/buscar:', error);
    res.status(500).json({ error: 'Error al buscar cliente' });
  }
});

// GET /clientes/:id - Obtener cliente por ID
router.get('/:id', checkPermission('ver_clientes'), async (req, res) => {
  try {
    const { id } = req.params;
    const cliente = await Cliente.query().findById(id);
    if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json(cliente);
  } catch (error) {
    console.error('Error en GET /clientes/:id:', error);
    res.status(500).json({ error: 'Error al obtener cliente' });
  }
});

// POST /clientes - Crear nuevo cliente
router.post('/', checkPermission('crear_cliente'), async (req, res) => {
  const { nit, nombre, direccion, correo } = req.body;
  if (!nit || !nombre) return res.status(400).json({ error: 'nit y nombre requeridos' });

  try {
    // Verificar si ya existe un cliente con el mismo NIT
    const clienteExistente = await Cliente.query().findOne({ nit });
    if (clienteExistente) {
      return res.status(409).json({ error: 'Ya existe un cliente con este NIT' });
    }

    const c = await Cliente.query()
      .insert({ 
        nit, 
        nombre, 
        direccion: direccion || null, 
        correo: correo || null 
      })
      .returning('*');
    
    res.status(201).json(c);
  } catch (error) {
    console.error('Error en POST /clientes:', error);
    res.status(500).json({ error: 'Error al crear cliente' });
  }
});

// PATCH /clientes/:id - Actualizar cliente
router.patch('/:id', checkPermission('editar_cliente'), async (req, res) => {
  try {
    const { id } = req.params;
    const { nit, nombre, direccion, correo } = req.body;

    // Verificar si el cliente existe
    const clienteExistente = await Cliente.query().findById(id);
    if (!clienteExistente) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    // Verificar si el NIT ya está en uso por otro cliente
    if (nit && nit !== clienteExistente.nit) {
      const clienteConNit = await Cliente.query().findOne({ nit }).whereNot('id', id);
      if (clienteConNit) {
        return res.status(409).json({ error: 'El NIT ya está en uso por otro cliente' });
      }
    }

    const clienteActualizado = await Cliente.query()
      .patchAndFetchById(id, {
        nit: nit || clienteExistente.nit,
        nombre: nombre || clienteExistente.nombre,
        direccion: direccion !== undefined ? direccion : clienteExistente.direccion,
        correo: correo !== undefined ? correo : clienteExistente.correo
      });

    res.json(clienteActualizado);
  } catch (error) {
    console.error('Error en PATCH /clientes/:id:', error);
    res.status(500).json({ error: 'Error al actualizar cliente' });
  }
});

// DELETE /clientes/:id - Eliminar cliente
router.delete('/:id', checkPermission('eliminar_cliente'), async (req, res) => {
  try {
    const { id } = req.params;

    const cliente = await Cliente.query().findById(id);
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    await Cliente.query().deleteById(id);

    res.json({ message: 'Cliente eliminado correctamente' });
  } catch (error) {
    console.error('Error en DELETE /clientes/:id:', error);
    res.status(500).json({ error: 'Error al eliminar cliente' });
  }
});

module.exports = router;
