const Knex = require('knex');
const knexConfig = require('../database/knexfile');
const { Model } = require('objection');
const Permiso = require('../models/Permiso');
const Modulo = require('../models/Modulo');

const knex = Knex(knexConfig.development);
Model.knex(knex);

(async () => {
  try {
    const permisos = await Permiso.query();

    for (const permiso of permisos) {
      const modulo = await Modulo.query().findOne({ nombre: permiso.modulo });
      if (modulo) {
        await Permiso.query()
          .patch({ modulo_id: modulo.id })
          .where('id', permiso.id);
      }
    }

    console.log('✅ Permisos actualizados correctamente.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error actualizando permisos:', err);
    process.exit(1);
  }
})();
