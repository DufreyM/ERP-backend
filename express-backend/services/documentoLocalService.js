// Nombre del archivo: documentoLocalService.js

// Principales funciones y pequeña descripción de las mismas:
// 1. router.get('/'): Obtiene todos los documentos locales con sus relaciones (usuario y local).
// 2. router.get('/:id'): Obtiene un solo documento local por ID.
// 3. router.post('/'): Crea un nuevo documento local con los datos del cuerpo de la solicitud.
// 4. router.put('/:id'): Actualiza un documento existente.
// 5. router.delete('/:id'): Elimina un documento local por ID.

// Archivos relacionados:
// - models/DocumentoLocal.js: Define el modelo de datos para los documentos locales.
// - database/knexfile.js: Configuración de base de datos.
// - app.js o index.js: Punto de entrada donde se importa este router.

// Autor: Leonardo Dufrey Mejía Mejía, 23648
// Última modificación: 13/07/2025

// express-backend\services\documentoLocalService.js
const express = require('express');
const router = express.Router();
const DocumentoLocal = require('../models/DocumentoLocal');
const Calendario = require('../models/Calendario');
const cloudinary = require('../services/cloudinary');
const auth = require('../middlewares/authMiddleware');
const { 
    crearNotificacionesDeVencimientoDoc, 
    eliminarNotificacionesDeDocumento 
} = require('./notificacionesVencimientoDoc');

router.use(auth);

// Obtener todos los documentos activos
router.get('/', async (req, res) => {
  try {
    const localId = req.query.local_id;

    const docs = await DocumentoLocal
      .query()
      .whereNull('deletedat')
      .modify(query => {
        if (localId) {
          query.where('local_id', localId);
        }
      })
      .withGraphFetched('[usuario, local]')
      .modifyGraph('usuario', builder => {
        builder.select('id', 'rol_id', 'nombre', 'apellidos', 'email');
      })
      .modifyGraph('local', builder => {
        builder.select('id', 'nombre', 'direccion', 'nit_emisor');
      });

    const filtrado = docs.map(doc => ({
      id: doc.id,
      nombre: doc.nombre,
      archivo: doc.archivo,
      creacion: doc.creacion,
      vencimiento: doc.vencimiento,
      updatedat: doc.updatedat,
      deletedat: doc.deletedat,
      usuario: doc.usuario,
      local: doc.local
    }));

    res.json(filtrado);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener documentos', details: err.message });
  }
});

// Obtener un documento por ID (solo si no está eliminado)
router.get('/:id', async (req, res) => {
  try {
    const doc = await DocumentoLocal
      .query()
      .findById(req.params.id)
      .whereNull('deletedat')
      .withGraphFetched('[usuario, local]')
      .modifyGraph('usuario', builder => {
        builder.select('id', 'nombre', 'apellidos', 'email');
      })
      .modifyGraph('local', builder => {
        builder.select('id', 'nombre', 'direccion', 'nit_emisor');
      });

    if (!doc) return res.status(404).json({ error: 'Documento no encontrado' });

    const filtrado = {
      id: doc.id,
      nombre: doc.nombre,
      archivo: doc.archivo,
      creacion: doc.creacion,
      vencimiento: doc.vencimiento,
      updatedat: doc.updatedat,
      deletedat: doc.deletedat,
      usuario: doc.usuario,
      local: doc.local
    };

    res.json(filtrado);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener el documento', details: err.message });
  }
});

// Crear nuevo documento con notificaciones
router.post('/', async (req, res) => {
  try {
    let archivoURL = null;

    // Manejar subida de archivo si existe
    if (req.files?.archivo) {
      const resultado = await cloudinary.uploader.upload(req.files.archivo.tempFilePath, {
        folder: 'documentos_locales', 
        resource_type: 'auto',
        type: 'upload'
      });
      archivoURL = resultado.secure_url;
    } else if (req.body.archivo) {
      archivoURL = req.body.archivo;
    }

    const datosDocumento = {
      ...req.body,
      usuario_id: req.user.id, // Usar el usuario autenticado
      local_id: parseInt(req.body.local_id, 10),
      archivo: archivoURL,
      creacion: new Date().toISOString(),
      updatedat: new Date().toISOString()
    };

    // Validar campos requeridos
    if (!datosDocumento.nombre || !datosDocumento.local_id) {
      return res.status(400).json({ error: 'Nombre y local_id son campos requeridos' });
    }

    const nuevo = await DocumentoLocal.query().insert(datosDocumento);

    // Crear notificaciones de vencimiento si existe fecha de vencimiento
    if (datosDocumento.vencimiento) {
      try {
        await crearNotificacionesDeVencimientoDoc(
          nuevo,
          req.user,
          datosDocumento.local_id
        );
      } catch (notifErr) {
        console.warn('No se pudieron crear las notificaciones del documento:', notifErr.message);
        // Continuar aunque falle la notificación
      }
    }

    res.status(201).json({
      mensaje: 'Documento creado exitosamente',
      documento: nuevo
    });
  } catch (err) {
    console.error('Error al crear documento:', err);
    res.status(400).json({ 
      error: 'Error al crear el documento', 
      details: err.message 
    });
  }
});

// Actualizar documento y notificaciones
router.put('/:id', async (req, res) => {
  try {
    let archivoURL = req.body.archivo;

    // Manejar subida de archivo si existe
    if (req.files?.archivo) {
      const resultado = await cloudinary.uploader.upload(req.files.archivo.tempFilePath, {
        folder: 'documentos_locales', 
        resource_type: 'auto',
        type: 'upload'
      });
      archivoURL = resultado.secure_url;
    }

    const data = {
      ...req.body,
      updatedat: new Date().toISOString()
    };

    if (archivoURL !== undefined) {
      data.archivo = archivoURL;
    }

    const actualizado = await DocumentoLocal.query().patchAndFetchById(req.params.id, data);
    if (!actualizado) return res.status(404).json({ error: 'Documento no encontrado' });

    // Si se actualizó la fecha de vencimiento, recrear notificaciones
    if (req.body.vencimiento) {
      try {
        // Primero eliminar notificaciones existentes para este documento
        await Calendario.query()
          .where('titulo', 'like', `%${actualizado.nombre}%`)
          .delete();

        // Crear nuevas notificaciones
        await crearNotificacionesDeVencimientoDoc(
          actualizado,
          req.user,
          actualizado.local_id
        );
      } catch (notifErr) {
        console.warn('No se pudieron actualizar las notificaciones:', notifErr.message);
      }
    }

    res.json({
      mensaje: 'Documento actualizado exitosamente',
      documento: actualizado
    });
  } catch (err) {
    console.error('Error al actualizar documento:', err);
    res.status(400).json({ 
      error: 'Error al actualizar el documento', 
      details: err.message 
    });
  }
});

// Eliminar documento (lógicamente) y sus notificaciones
router.delete('/:id', async (req, res) => {
  try {
    // Primero obtener el documento antes de eliminarlo
    const documento = await DocumentoLocal.query().findById(req.params.id);
    if (!documento) {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }

    const eliminado = await DocumentoLocal.query()
      .patchAndFetchById(req.params.id, {
        deletedat: new Date().toISOString()
      });

    // Eliminar notificaciones asociadas
    try {
      await eliminarNotificacionesDeDocumento(req.params.id);
    } catch (notifErr) {
      console.warn('No se pudieron eliminar las notificaciones:', notifErr.message);
    }

    res.json({ 
      mensaje: 'Documento eliminado lógicamente', 
      documento: eliminado 
    });
  } catch (err) {
    console.error('Error al eliminar documento:', err);
    res.status(500).json({ 
      error: 'Error al eliminar el documento', 
      details: err.message 
    });
  }
});

module.exports = router;
