'use strict';

const { Router } = require('express');
const { getPatientHistory } = require('../services/patientService');

const router = Router();

// GET /api/patients/:email/history — historial de citas del paciente
router.get('/:email/history', async (req, res, next) => {
  try {
    const { email } = req.params;
    const historial = await getPatientHistory(decodeURIComponent(email));

    if (!historial) return res.status(404).json({ ok: false, error: 'Paciente no encontrado' });

    return res.json({ ok: true, data: historial });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
