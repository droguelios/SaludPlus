'use strict';

const { Router } = require('express');
const { runMigration } = require('../services/migrationService');

const router = Router();

// POST /api/simulacro/migrate — corre la migración del CSV a las dos bases de datos
router.post('/migrate', async (req, res, next) => {
  try {
    const resultado = await runMigration();
    return res.json({ ok: true, result: resultado });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
