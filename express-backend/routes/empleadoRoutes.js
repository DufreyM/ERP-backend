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
// Última modificación: 17/09/2025

const router = require('express').Router();
const Usuario = require('../models/Usuario');
const auth = require('../middlewares/authMiddleware');
const authorizeRole = require('../middlewares/authorizeRole');
const checkPermission = require('../middlewares/checkPermission');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// CORRECCIÓN: Importar mailService correctamente
const mailService = require('../services/mailService');

function generateToken() {
  return crypto.randomBytes(16).toString('hex');
}

// Aplicar autenticación a todas las rutas
router.use(auth);

// GET /empleados - Obtener lista de empleados con filtros
router.get('/', checkPermission('ver_empleados'), async (req, res) => {
  try {
    const { rol_id, status, id_local, page = 1, limit = 10 } = req.query;
    
    // Construir query base - solo empleados (rol_id 1 o 2)
    let query = Usuario.query()
      .whereIn('rol_id', [1, 2])
      .withGraphFetched('[rol, local]')
      .orderBy('id', 'desc');
    
    // Aplicar filtros si existen
    if (rol_id) query = query.where('rol_id', rol_id);
    if (status) query = query.where('status', status);
    if (id_local) query = query.where('id_local', id_local);
    
    // Paginación
    const offset = (page - 1) * limit;
    const empleados = await query
      .offset(offset)
      .limit(limit);
    
    // Contar total de registros
    const totalQuery = Usuario.query()
      .whereIn('rol_id', [1, 2])
      .count('id as count')
      .first();
    
    if (rol_id) totalQuery.where('rol_id', rol_id);
    if (status) totalQuery.where('status', status);
    if (id_local) totalQuery.where('id_local', id_local);
    
    const totalCount = await totalQuery;
    const total = parseInt(totalCount.count);
    
    res.json({
      empleados,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error al obtener empleados:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /empleados/:id - Obtener un empleado específico
router.get('/:id', checkPermission('ver_empleados'), authorizeRole([1]), async (req, res) => {
  try {
    const { id } = req.params;
    const empleado = await Usuario.query()
      .findById(id)
      .whereIn('rol_id', [1, 2])
      .withGraphFetched('[rol, local]');
    
    if (!empleado) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }
    
    res.json(empleado);
  } catch (error) {
    console.error('Error al obtener empleado:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /empleados - Crear un nuevo empleado
router.post('/', checkPermission('crear_empleado'), async (req, res) => {
  try {
    const { nombre, apellidos, rol_id, email, status, id_local, contrasena, fechanacimiento } = req.body;
    
    // Validaciones básicas
    if (!nombre || !apellidos || !rol_id || !email || !status || !contrasena || !fechanacimiento) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }
    
    // Verificar que el rol sea válido (solo 1 o 2)
    if (![1, 2].includes(parseInt(rol_id))) {
      return res.status(400).json({ error: 'Rol no válido para empleados' });
    }
    
    // Verificar si el email ya existe
    const existeEmail = await Usuario.query().findOne({ email });
    if (existeEmail) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    // Generar token de verificación
    const token = mailService.generateToken();
    
    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(contrasena, 10);
    
    // Crear el empleado
    const nuevoEmpleado = await Usuario.query().insert({
      nombre,
      apellidos,
      rol_id,
      email,
      status: 'inactivo', // Siempre inactivo hasta verificación
      id_local: id_local || null,
      contrasena: hashedPassword,
      fechanacimiento,
      token, // Guardar el token para verificación
      verificado: false // Inicialmente no verificado
    });
    
    // Enviar correo de verificación
    try {
      await mailService.sendVerificationEmail(email, token);
      
      res.status(201).json({
        ...nuevoEmpleado,
        message: 'Empleado creado exitosamente. Se ha enviado un correo de verificación.'
      });
    } catch (emailError) {
      console.error('Error al enviar correo de verificación:', emailError);
      // Si falla el correo, eliminar el usuario creado
      await Usuario.query().deleteById(nuevoEmpleado.id);
      return res.status(500).json({ 
        error: 'Error al enviar correo de verificación. El empleado no fue creado.' 
      });
    }
    
  } catch (error) {
    console.error('Error al crear empleado:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PATCH /empleados/:id - Actualizar parcialmente un empleado
router.patch('/:id', checkPermission('editar_empleado'), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar que el empleado existe y es de rol 1 o 2
    const empleadoExistente = await Usuario.query()
      .findById(id)
      .whereIn('rol_id', [1, 2]);
    
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

    // Validar que el rol sea válido (solo 1 o 2) si se está actualizando
    if (datosActualizados.rol_id && ![1, 2].includes(parseInt(datosActualizados.rol_id))) {
      return res.status(400).json({ error: 'Rol no válido para empleados' });
    }

    // Verificar si el email ya existe en otro usuario (solo si se está actualizando el email)
    if (datosActualizados.email && datosActualizados.email !== empleadoExistente.email) {
      const existeEmail = await Usuario.query()
        .where('email', datosActualizados.email)
        .whereNot('id', id)
        .first();
      
      if (existeEmail) {
        return res.status(400).json({ error: 'El email ya está registrado' });
      }
    }

    // Actualizar el empleado
    const empleadoActualizado = await Usuario.query()
      .patchAndFetchById(id, datosActualizados)
      .withGraphFetched('[rol, local]');

    res.json(empleadoActualizado);
  } catch (error) {
    console.error('Error al actualizar empleado:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// DELETE /empleados/:id - Eliminar (desactivar) un empleado
router.delete('/:id', checkPermission('eliminar_empleado'), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar que el empleado existe y es de rol 1 o 2
    const empleadoExistente = await Usuario.query()
      .findById(id)
      .whereIn('rol_id', [1, 2]);
    
    if (!empleadoExistente) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }
    
    // En lugar de eliminar, cambiamos el status a inactivo
    await Usuario.query()
      .patch({ status: 'inactivo' })
      .where('id', id);
    
    res.json({ message: 'Empleado desactivado correctamente' });
  } catch (error) {
    console.error('Error al desactivar empleado:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
