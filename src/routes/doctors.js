'use strict';

const { Router } = require('express');
const { listDoctors, getDoctorById, updateDoctor } = require('../services/doctorService');

const router = Router();

// GET /api/doctors — lista todos los médicos (con filtro opcional por especialidad)
router.get('/', async (req, res, next) => {
  try {
    const { specialty } = req.query;
    const medicos = await listDoctors({ specialty });
    return res.json({ ok: true, data: medicos });
  } catch (err) {
    next(err);
  }
});

// GET /api/doctors/:id — obtiene un médico por ID
router.get('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ ok: false, error: 'ID inválido' });

    const medico = await getDoctorById(id);
    if (!medico) return res.status(404).json({ ok: false, error: 'Médico no encontrado' });

    return res.json({ ok: true, data: medico });
  } catch (err) {
    next(err);
  }
});

// PUT /api/doctors/:id — actualiza un médico (también actualiza en MongoDB)
router.put('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ ok: false, error: 'ID inválido' });

    const { name, email, specialty } = req.body;
    const actualizado = await updateDoctor(id, { name, email, specialty });

    if (!actualizado) return res.status(404).json({ ok: false, error: 'Médico no encontrado' });

    return res.json({ ok: true, data: actualizado });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ ok: false, error: err.message });
    next(err);
  }
});

module.exports = router;
