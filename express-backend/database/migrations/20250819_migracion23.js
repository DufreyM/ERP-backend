const fs = require('fs');
const path = require('path');

exports.up = async function(knex) {
    await knex.schema.table('usuarios', (table) => {
        table.text('foto_perfil').nullable();       // URL de Cloudinary
        table.text('foto_public_id').nullable();    // Public ID de Cloudinary
    });
};

exports.down = async function(knex) {
    await knex.schema.table('usuarios', (table) => {
        table.dropColumn('foto_perfil');
        table.dropColumn('foto_public_id');
    });
};