'use strict';

const { pool } = require('../config/postgres');

// Genera un reporte de ingresos agrupado por aseguradora
async function getRevenueReport({ startDate, endDate } = {}) {
  const condiciones = [];
  const params = [];
  let idx = 1;

  // Filtros opcionales de fecha
  if (startDate) { params.push(new Date(startDate)); condiciones.push(`a.appointment_date >= $${idx++}`); }
  if (endDate)   { params.push(new Date(endDate));   condiciones.push(`a.appointment_date <= $${idx++}`); }

  const where = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '';

  const { rows } = await pool.query(
    `SELECT
       i.name              AS insurance,
       SUM(a.amount_paid)  AS total,
       COUNT(a.id)         AS appointment_count
     FROM appointments a
     JOIN insurances i ON i.id = a.insurance_id
     ${where}
     GROUP BY i.name
     ORDER BY total DESC`,
    params
  );

  // Calcular el total general sumando todas las aseguradoras
  const totalIngresos = rows.reduce((acc, r) => acc + parseFloat(r.total), 0);

  return {
    totalRevenue: parseFloat(totalIngresos.toFixed(2)),
    byInsurance: rows.map((r) => ({
      insurance:        r.insurance,
      total:            parseFloat(r.total),
      appointmentCount: parseInt(r.appointment_count, 10),
    })),
    period: { startDate: startDate || null, endDate: endDate || null },
  };
}

module.exports = { getRevenueReport };
