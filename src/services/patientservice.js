'use strict';

const { PatientHistory } = require('../config/mongodb');

// Devuelve el historial completo de un paciente buscando solo por email
async function getPatientHistory(email) {
  const emailNormalizado = (email || '').trim().toLowerCase();

  // Una sola consulta a MongoDB — no se necesitan joins
  const doc = await PatientHistory.findOne({ patientEmail: emailNormalizado }).lean();
  if (!doc) return null;

  const { patientEmail, patientName, appointments, createdAt, updatedAt } = doc;

  // Calcular resumen en memoria
  const totalCitas   = appointments.length;
  const totalGastado = appointments.reduce((acc, c) => acc + (c.amountPaid || 0), 0);

  // Especialidad más frecuente
  const conteoEspecialidades = {};
  for (const cita of appointments) {
    conteoEspecialidades[cita.specialty] = (conteoEspecialidades[cita.specialty] || 0) + 1;
  }
  const especialidadFrecuente =
    Object.entries(conteoEspecialidades).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

  return {
    patientEmail,
    patientName,
    createdAt,
    updatedAt,
    appointments,
    summary: {
      totalAppointments:     totalCitas,
      totalSpent:            parseFloat(totalGastado.toFixed(2)),
      mostFrequentSpecialty: especialidadFrecuente,
    },
  };
}

module.exports = { getPatientHistory };
