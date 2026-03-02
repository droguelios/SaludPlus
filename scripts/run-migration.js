'use strict';

/**
 * Script para correr la migración desde la terminal sin necesitar el servidor.
 * Uso: node scripts/run-migration.js
 */

require('../src/config/env');
const { initSchema }   = require('../src/config/postgres');
const { connectMongo } = require('../src/config/mongodb');
const { runMigration } = require('../src/services/migrationService');

(async () => {
  try {
    console.log('[Migración] Conectando a las bases de datos…');
    await connectMongo();
    await initSchema();

    console.log('[Migración] Ejecutando migración…');
    const resultado = await runMigration();

    console.log('[Migración] ¡Completada!');
    console.log(JSON.stringify({ ok: true, result: resultado }, null, 2));
    process.exit(0);
  } catch (err) {
    console.error('[Migración] FALLÓ:', err.message);
    process.exit(1);
  }
})();
