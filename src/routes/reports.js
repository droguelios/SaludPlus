'use strict';

const { Router } = require('express');
const { getRevenueReport } = require('../services/reportService');

const router = Router();

// GET /api/reports/revenue — reporte de ingresos por aseguradora
router.get('/revenue', async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    if (startDate && isNaN(Date.parse(startDate))) {
      return res.status(400).json({ ok: false, error: 'startDate inválido' });
    }
    if (endDate && isNaN(Date.parse(endDate))) {
      return res.status(400).json({ ok: false, error: 'endDate inválido' });
    }

    const reporte = await getRevenueReport({ startDate, endDate });
    return res.json({ ok: true, data: reporte });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
