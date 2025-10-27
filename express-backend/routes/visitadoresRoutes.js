// Nombre del archivo: visitadorMedicoRoutes.js

// Principales rutas y pequeña descripción de las mismas:
// 1. GET /: Obtiene todos los visitadores médicos con sus relaciones (usuario y proveedor).
// 2. GET /activos: Devuelve los visitadores cuyo usuario tiene status 'activo'.
// 3. GET /:id: Obtiene un visitador médico por su ID con relaciones.
// 4. GET /proveedor/:proveedorId: Obtiene visitadores asociados a un proveedor.
// 5. GET /por-local/:localId: Devuelve visitadores activos relacionados a un local específico.
// 6. GET /search?q=texto: Busca visitadores por nombre o apellido del usuario.
// 7. POST /: Crea un nuevo visitador médico usando insertGraph.
// 8. PUT /:id: Actualiza un visitador médico existente.
// 9. PATCH /:id/deactivate: Cambia el estado del usuario relacionado a 'inactivo'.
// 10. PATCH /:id/activate: Cambia el estado del usuario relacionado a 'activo'.

// Archivos relacionados:
// - models/VisitadorMedico.js: Modelo de datos para los visitadores médicos.
// - models/Usuario.js: Modelo del usuario relacionado al visitador.
// - models/Proveedor.js: Modelo del proveedor relacionado al visitador.
// - app.js o index.js: Punto de entrada donde se importa este router.

// Autor: Leonardo Dufrey Mejía Mejía, 23648
// modificado: Renato R.
// Última modificación: 26/10/2025

const express = require('express');
const router = express.Router();
const VisitadorMedico = require('../models/VisitadorMedico');
const Usuario = require('../models/Usuario');
const authenticateToken = require('../middlewares/authMiddleware');
const { formatVisitador } = require('../helpers/formatters/visitadoresFormatter');
const { transaction, raw } = require('objection')
// router.use(authenticateToken);

// Helper para relaciones por defecto
const RELACIONES = '[usuario, proveedor, telefonos]';

// Crear nuevo visitador médico
router.post('/', async (req, res) => {
  try {
    if (req.body.usuario) {
      req.body.usuario.status = 'inactivo';
    }

    const nuevo = await transaction(VisitadorMedico.knex(), async (trx) => {
      // insertGraph dentro del trx
      const inserted = await VisitadorMedico.query(trx).insertGraph(req.body);
      return inserted;
    });

    res.status(201).json(nuevo);
  } catch (err) {
    console.error('Error al crear visitador:', err);
    res.status(400).json({ error: 'Error al crear visitador médico', details: err.message });
  }
});



router.use(authenticateToken);

// Obtener todos los visitadores médicos
router.get('/', async (req, res) => {
  try {
    const visitadores = await VisitadorMedico.query().withGraphFetched(RELACIONES);

    //datos filtrados 
    const formatted = visitadores.map(formatVisitador);
    //res.json(formatted)
    res.json(visitadores);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener visitadores médicos', details: err.message });
  }
});

// Obtener visitadores médicos activos (basado en status del usuario)
router.get('/activos', async (req, res) => {
  try {
    const visitadores = await VisitadorMedico.query()
      .withGraphFetched(RELACIONES)
      .whereExists(
        VisitadorMedico.relatedQuery('usuario').where('status', 'activo')
      );
    //datos filtrados 
    const formatted = visitadores.map(formatVisitador);
    //res.json(formatted)
    res.json(visitadores);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener visitadores activos', details: err.message });
  }
});

// Obtener visitador médico por ID
router.get('/:id', async (req, res) => {
  try {
    const visitador = await VisitadorMedico.query()
      .findById(req.params.id)
      .withGraphFetched(RELACIONES);

    if (!visitador) {
      return res.status(404).json({ error: 'Visitador no encontrado' });
    }
    //datos filtrados 
    const formatted = formatVisitador(visitador);
    //res.json(formatted)
    res.json(visitador);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener visitador médico', details: err.message });
  }
});

// Obtener visitadores por proveedor
router.get('/proveedor/:proveedorId', async (req, res) => {
  try {
    const visitadores = await VisitadorMedico.query()
      .where('proveedor_id', req.params.proveedorId)
      .withGraphFetched(RELACIONES);

    //datos filtrados 
    const formatted = visitadores.map(formatVisitador);
    //res.json(formatted)
    res.json(visitadores);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener visitadores por proveedor', details: err.message });
  }
});

// Obtener visitadores médicos por local con status activo
//ya tiene filtro
router.get('/por-local/:localId', async (req, res) => {
  try {
    const visitadores = await VisitadorMedico.query()
      .withGraphFetched(RELACIONES)
      .whereExists(
        VisitadorMedico.relatedQuery('usuario')
          .where('id_local', req.params.localId)
          .andWhere('status', 'activo')
      );

    const formatted = visitadores.map(v => ({
      id: v.id,
      nombre: `${v.usuario?.nombre || ''} ${v.usuario?.apellidos || ''}`.trim()
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener visitadores por local', details: err.message });
  }
});

// Buscar visitadores por nombre o apellidos del usuario
router.get('/search', async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: 'Debe enviar un parámetro de búsqueda ?q=' });

    const visitadores = await VisitadorMedico.query()
      .withGraphFetched(RELACIONES)
      .whereExists(
        VisitadorMedico.relatedQuery('usuario')
          .where('nombre', 'like', `%${query}%`)
          .orWhere('apellidos', 'like', `%${query}%`)
      );

    res.json(visitadores);
  } catch (err) {
    res.status(500).json({ error: 'Error al buscar visitadores', details: err.message });
  }
});


// PUT /visitadores/:id
router.put('/:id', async (req, res) => {
  const visitadorId = parseInt(req.params.id);
  const data = req.body;

  try {
    // Validaciones previas sin trx...
    if (!data.usuario || typeof data.usuario !== 'object') {
      return res.status(400).json({ error: 'El objeto usuario es obligatorio' });
    }
    if (data.telefonos && !Array.isArray(data.telefonos)) {
      return res.status(400).json({ error: 'El campo telefonos debe ser un arreglo' });
    }

    const resultado = await transaction(VisitadorMedico.knex(), async (trx) => {
      // 1) Buscar visitador dentro del trx
      const visitador = await VisitadorMedico.query(trx)
        .findById(visitadorId)
        .withGraphFetched('[usuario, telefonos]');

      if (!visitador) {
        const e = new Error('Visitador no encontrado');
        e.status = 404;
        throw e;
      }

      // 2) Actualizar usuario relacionado
      await Usuario.query(trx)
        .patch({
          nombre: data.usuario.nombre,
          apellidos: data.usuario.apellidos,
          email: data.usuario.email,
          fechanacimiento: data.usuario.fechanacimiento,
          rol_id: data.usuario.rol_id,
          status: data.usuario.status,
          ...(data.usuario.contrasena !== 'unchanged' && {
            contrasena: data.usuario.contrasena,
          }),
        })
        .where('id', visitador.usuario_id);

      // 3) Actualizar datos del visitador
      await VisitadorMedico.query(trx)
        .patch({
          proveedor_id: data.proveedor_id ?? null,
        })
        .where('id', visitadorId);

      // 4) Actualizar o crear teléfonos (usar modelo Teléfono con trx)
      if (data.telefonos && data.telefonos.length > 0) {
        const Telefono = require('../models/Telefono');

        for (const tel of data.telefonos) {
          if (tel.id) {
            // actualizar
            await Telefono.query(trx)
              .patch({
                numero: tel.numero,
                tipo: tel.tipo,
              })
              .where('id', tel.id);
          } else {
            // crear nuevo
            await Telefono.query(trx).insert({
              numero: tel.numero,
              tipo: tel.tipo,
              visitador_id: visitadorId,
            });
          }
        }
      }

      // 5) Traer la entidad actualizada y devolverla
      const actualizado = await VisitadorMedico.query(trx)
        .findById(visitadorId)
        .withGraphFetched('[usuario, proveedor, telefonos]');

      return actualizado;
    }); 

    res.json({
      ok: true,
      message: 'Visitador actualizado correctamente',
      visitador: resultado,
    });
  } catch (err) {
    console.error('Error al actualizar visitador:', err);
    if (err.status === 404) {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({
      error: 'Error al actualizar visitador',
      details: err.message,
    });
  }
});


router.get('/:id/telefonos', async (req, res) => {
  try {
    const telefonos = await VisitadorMedico.relatedQuery('telefonos')
      .for(req.params.id);

    res.json(telefonos);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener teléfonos', details: err.message });
  }
});

// Activar/Desactivar visitador (usuario.status)
async function cambiarEstadoUsuario(req, res, estado) {
  try {
    const result = await transaction(VisitadorMedico.knex(), async (trx) => {
      const visitador = await VisitadorMedico.query(trx)
        .findById(req.params.id)
        .withGraphFetched('usuario');

      if (!visitador) {
        const e = new Error('Visitador no encontrado');
        e.status = 404;
        throw e;
      }

      await Usuario.query(trx).patch({ status: estado }).where('id', visitador.usuario_id);

      return true;
    });

    res.json({ message: `Visitador ${estado === 'activo' ? 'activado' : 'desactivado'}` });
  } catch (err) {
    console.error(err);
    if (err.status === 404) return res.status(404).json({ error: err.message });
    res.status(500).json({ error: `Error al cambiar estado a ${estado}`, details: err.message });
  }
}

router.patch('/:id/deactivate', (req, res) => cambiarEstadoUsuario(req, res, 'inactivo'));
router.patch('/:id/activate', (req, res) => cambiarEstadoUsuario(req, res, 'activo'));

// PATCH /visitadores/:id/telefonos
router.patch('/:id/telefonos', async (req, res) => {
  try {
    const { id } = req.params;
    let { telefonos } = req.body;
    if (!Array.isArray(telefonos)) return res.status(400).json({ error: 'telefonos debe ser arreglo' });

    telefonos = telefonos.map(String).map(s => s.trim()).filter(Boolean);

    const updated = await transaction(VisitadorMedico.knex(), async (trx) => {
      const u = await VisitadorMedico.query(trx).patchAndFetchById(id, { telefonos });
      if (!u) {
        const e = new Error('Visitador no encontrado');
        e.status = 404;
        throw e;
      }
      return u;
    });

    res.json({ ok: true, visitador: updated });
  } catch (e) {
    console.error(e);
    if (e.status === 404) return res.status(404).json({ error: e.message });
    res.status(500).json({ error: 'Error actualizando teléfonos' });
  }
});

// POST /visitadores/:id/documento  (reemplaza el existente y borra en Cloudinary)
router.post('/:id/documento', async (req, res) => {
  try {
    const { id } = req.params;
    const visitador = await VisitadorMedico.query().findById(id);
    if (!visitador) return res.status(404).json({ error: 'Visitador no encontrado' });

    if (!req.files || !req.files.pdf) return res.status(400).json({ error: 'Adjunta el archivo "pdf"' });
    const pdf = req.files.pdf;

    if (pdf.mimetype !== 'application/pdf') {
      return res.status(400).json({ error: 'El archivo debe ser PDF' });
    }

    // 1) Subir el nuevo PDF a Cloudinary
    const uploaded = await cloudinary.uploader.upload(pdf.tempFilePath, {
      resource_type: 'raw',
      folder: 'econofarma/visitadores',
      use_filename: true,
      unique_filename: true
    });

    // Si algo falla en la BD, debemos borrar 'uploaded' para no dejar basura.
    try {
      const updated = await transaction(VisitadorMedico.knex(), async (trx) => {
        // Actualizar metadata en BD dentro de trx
        const u = await VisitadorMedico.query(trx).patchAndFetchById(id, {
          documento_url: uploaded.secure_url,
          documento_public_id: uploaded.public_id,
          documento_nombre: pdf.name,
          documento_mime: pdf.mimetype,
          documento_bytes: pdf.size,
          documento_updated_at: raw('now()')
        });

        if (!u) {
          const e = new Error('Visitador no encontrado');
          e.status = 404;
          throw e;
        }

        // Intentar borrar el anterior en Cloudinary (si existía).
        // Lo hacemos fuera del trx (pero dentro del bloque exitoso) — si falla, solo lo logueamos.
        if (visitador.documento_public_id) {
          try {
            await cloudinary.uploader.destroy(visitador.documento_public_id, { resource_type: 'raw' });
          } catch (e) {
            console.warn('No se pudo borrar el documento anterior en Cloudinary:', e.message);
          }
        }

        return u;
      });

      res.status(201).json({ ok: true, documento: {
        url: updated.documento_url,
        public_id: updated.documento_public_id,
        nombre: updated.documento_nombre,
        mime: updated.documento_mime,
        bytes: updated.documento_bytes,
        updated_at: updated.documento_updated_at
      }});
    } catch (e) {
      // Si la BD falló después del upload, borrar el archivo subido para evitar assets huérfanos.
      try {
        await cloudinary.uploader.destroy(uploaded.public_id, { resource_type: 'raw' });
      } catch (delErr) {
        console.warn('No se pudo borrar el upload nuevo tras fallo en BD:', delErr.message);
      }
      throw e; // lo re-lanzamos para ser manejado en el catch externo
    }
  } catch (e) {
    console.error(e);
    if (e.status === 404) return res.status(404).json({ error: e.message });
    res.status(500).json({ error: 'Error al subir/reemplazar el documento', details: e.message });
  }
});

// GET /visitadores/:id/documento
router.get('/:id/documento', async (req, res) => {
  try {
    const { id } = req.params;
    const v = await VisitadorMedico.query().findById(id).select(
      'documento_url', 'documento_nombre', 'documento_mime', 'documento_bytes', 'documento_updated_at'
    );
    if (!v) return res.status(404).json({ error: 'Visitador no encontrado' });
    if (!v.documento_url) return res.json({ ok: true, documento: null });

    res.json({ ok: true, documento: v });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error consultando documento' });
  }
});

// DELETE /visitadores/:id/documento
router.delete('/:id/documento', async (req, res) => {
  try {
    const { id } = req.params;
    const v = await VisitadorMedico.query().findById(id);
    if (!v) return res.status(404).json({ error: 'Visitador no encontrado' });

    // Intentar borrar en Cloudinary (si hay public_id). No hacemos rollback del DB si falla el destroy.
    if (v.documento_public_id) {
      try {
        await cloudinary.uploader.destroy(v.documento_public_id, { resource_type: 'raw' });
      } catch (e) {
        console.warn('No se pudo borrar en Cloudinary:', e.message);
      }
    }

    await transaction(VisitadorMedico.knex(), async (trx) => {
      await VisitadorMedico.query(trx).patchAndFetchById(id, {
        documento_url: null,
        documento_public_id: null,
        documento_nombre: null,
        documento_mime: null,
        documento_bytes: null,
        documento_updated_at: null
      });
    });

    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error eliminando documento' });
  }
});

module.exports = router;
