// Nombre del archivo: empleadosRoutes.js

// Principales rutas y pequeña descripción de las mismas:
// 1. GET /: Obtiene lista de empleados con filtros opcionales (rol_id, status, id_local)
// 2. POST /: Crea un nuevo empleado (solo administradores)
// 3. PUT /:id: Actualiza un empleado existente (solo administradores)
// 4. DELETE /:id: Elimina (desactiva) un empleado (solo administradores)

// Archivos relacionados:
// - models/Usuario.js: Modelo de datos para los usuarios/empleados
// - middlewares/authMiddleware.js: Middleware para autenticación JWT
// - middlewares/authorizeRole.js: Middleware para autorización por roles
// - app.js o index.js: Punto de entrada donde se importa este router

// Autora: María José Girón Isidro, 23559
// modificado: Renato R.
// Última modificación: 29/10/2025

const router = require('express').Router();
const Usuario = require('../models/Usuario');
const auth = require('../middlewares/authMiddleware');
const authorizeRole = require('../middlewares/authorizeRole');
const { formatEmpleado } = require('../helpers/formatters/empleadoFormatter');
const bcrypt = require('bcryptjs');

// Aplicar autenticación a todas las rutas
router.use(auth);

// GET /empleados - Obtener lista de empleados con filtros
router.get('/', authorizeRole([1]), async (req, res) => {
  try {
    const { rol_id, status, id_local, page = 1, limit = 10 } = req.query;
    
    // Construir query base 
    let query = Usuario.query()
      .whereNot('rol_id', 5)
      .whereNot('id', req.user.id) 
      .withGraphFetched('[rol, local]')
      .orderBy('id', 'desc');

    // Aplicar filtros si existen
    if (rol_id) query = query.where('rol_id', rol_id);
    if (status) query = query.where('status', status);
    if (id_local) query = query.where('id_local', id_local);

    // Paginación
    const offset = (page - 1) * limit;
    const empleados = await query.offset(offset).limit(limit);

    // Contar total de registros (también excluyendo al usuario autenticado)
    const totalQuery = Usuario.query()
      .whereNot('rol_id', 5)
      .whereNot('id', req.user.id); 

    if (rol_id) totalQuery.where('rol_id', rol_id);
    if (status) totalQuery.where('status', status);
    if (id_local) totalQuery.where('id_local', id_local);

    const totalCount = await totalQuery.count('id as count').first();
    const total = parseInt(totalCount.count);

    const formatted = empleados.map(formatEmpleado);

    res.json({
      empleados: formatted,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error al obtener empleados:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /empleados/:id - Obtener un empleado específico
router.get('/:id', authorizeRole([1]), async (req, res) => {
  try {
    const { id } = req.params;
    const empleado = await Usuario.query()
      .findById(id)
      .whereNot('rol_id', 5)
      .withGraphFetched('[rol, local]');
    
    if (!empleado) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }
    //datos filtados
    const formatted = formatEmpleado(empleado)
    res.json(formatted)
    
    //res.json(empleado);
  } catch (error) {
    console.error('Error al obtener empleado:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /empleados - Crear un nuevo empleado
router.post('/', authorizeRole([1]), async (req, res) => {
  const trx = await Usuario.startTransaction(); 
  try {
    const { nombre, apellidos, rol_id, email, status, id_local, contrasena, fechanacimiento } = req.body;
    
    // Validaciones básicas
    if (!nombre || !apellidos || !rol_id || !email || !status || !contrasena || !fechanacimiento) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }
    
    // Verificar si el email ya existe
    const existeEmail = await Usuario.query(trx).findOne({ email });
    if (existeEmail) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    const hashedPassword = await bcrypt.hash(contrasena, 10);

    // Crear el nuevo empleado dentro de la transacción
    const nuevoEmpleado = await Usuario.query(trx).insert({
      nombre,
      apellidos,
      rol_id,
      email,
      status,
      id_local: id_local || null,
      contrasena: hashedPassword, 
      fechanacimiento
    });
    
    // Si todo va bien, confirmar la transacción
    await trx.commit();

    res.status(201).json(nuevoEmpleado);
  } catch (error) {
    console.error('Error al crear empleado:', error);

    // Si ocurre un error, revertir los cambios
    await trx.rollback();

    res.status(500).json({ error: 'Error interno del servidor' });
  }
});


// PATCH /empleados/:id - Actualizar parcialmente un empleado
router.patch('/:id', authorizeRole([1]), async (req, res) => {
  const trx = await Usuario.startTransaction(); // Inicia la transacción
  try {
    const { id } = req.params;
    
    // Verificar que el empleado existe
    const empleadoExistente = await Usuario.query(trx).findById(id).whereNot('rol_id', 5);
    
    if (!empleadoExistente) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }

    // Campos permitidos para actualización
    const camposPermitidos = ['nombre', 'apellidos', 'rol_id', 'email', 'status', 'id_local', 'fechanacimiento'];
    const datosActualizados = {};

    // Filtrar solo los campos permitidos
    camposPermitidos.forEach(campo => {
      if (req.body[campo] !== undefined) {
        datosActualizados[campo] = req.body[campo];
      }
    });

    // Validar que se proporcionaron campos para actualizar
    if (Object.keys(datosActualizados).length === 0) {
      return res.status(400).json({ error: 'No se proporcionaron campos válidos para actualizar' });
    }

    // Verificar si el email ya existe en otro usuario
    if (datosActualizados.email && datosActualizados.email !== empleadoExistente.email) {
      const existeEmail = await Usuario.query(trx)
        .where('email', datosActualizados.email)
        .whereNot('id', id)
        .first();
      
      if (existeEmail) {
        return res.status(400).json({ error: 'El email ya está registrado' });
      }
    }

    // Actualizar el empleado dentro de la transacción
    const empleadoActualizado = await Usuario.query(trx)
      .patchAndFetchById(id, datosActualizados)
      .withGraphFetched('[rol, local]');

    // Si todo va bien, confirmar la transacción
    await trx.commit();
    res.json(empleadoActualizado);
  
  } catch (error) {
    console.error('Error al actualizar empleado:', error);

    // Si ocurre un error, revertir los cambios
    await trx.rollback();

    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// DELETE /empleados/:id - Eliminar (desactivar) un empleado
router.delete('/:id', authorizeRole([1]), async (req, res) => {
  const trx = await Usuario.startTransaction(); 

  try {
    const { id } = req.params;
    
    // Verificar que el empleado existe
    const empleadoExistente = await Usuario.query(trx).findById(id).whereNot('rol_id', 5);
    
    if (!empleadoExistente) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }
    
    // En lugar de eliminar, cambiamos el status a inactivo dentro de la transacción
    await Usuario.query(trx)
      .patch({ status: 'inactivo' })
      .where('id', id);

    // Si todo va bien, confirmar la transacción
    await trx.commit();
    
    res.json({ message: 'Empleado desactivado correctamente' });
  } catch (error) {
    console.error('Error al desactivar empleado:', error);

    // Si ocurre un error, revertir los cambios
    await trx.rollback();

    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
