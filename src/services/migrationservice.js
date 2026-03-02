'use strict';

const fs   = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { pool }         = require('../config/postgres');
const { PatientHistory } = require('../config/mongodb');
const env = require('../config/env');

// Convierte email a minúsculas y sin espacios
function normalizarEmail(valor) {
  return (valor || '').trim().toLowerCase();
}

// Capitaliza la primera letra de cada palabra
function normalizarNombre(valor) {
  return (valor || '')
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// Convierte texto a número (maneja comas y puntos)
function aNumero(valor) {
  const n = parseFloat((valor || '0').toString().replace(/,/g, '.'));
  return isNaN(n) ? 0 : n;
}

async function runMigration() {
  // 1. Leer el archivo CSV
  const rutaCsv = path.resolve(env.csv.ruta);
  if (!fs.existsSync(rutaCsv)) {
    throw new Error(`No se encontró el CSV en: ${rutaCsv}`);
  }

  const contenido = fs.readFileSync(rutaCsv, 'utf8');
  const filas = parse(contenido, { columns: true, skip_empty_lines: true, trim: true });

  if (!filas.length) throw new Error('El archivo CSV está vacío.');

  // 2. Deduplicar datos maestros en memoria antes de ir a la base de datos
  const pacientesMap   = new Map(); // email → datos del paciente
  const medicosMap     = new Map(); // email → datos del médico
  const aseguradorasMap = new Map(); // nombre → datos de aseguradora

  for (const fila of filas) {
    const emailPaciente = normalizarEmail(fila.patient_email);
    if (!pacientesMap.has(emailPaciente)) {
      pacientesMap.set(emailPaciente, {
        name:    normalizarNombre(fila.patient_name),
        phone:   (fila.patient_phone   || '').trim(),
        address: (fila.patient_address || '').trim(),
      });
    }

    const emailMedico = normalizarEmail(fila.doctor_email);
    if (!medicosMap.has(emailMedico)) {
      medicosMap.set(emailMedico, {
        name:      normalizarNombre(fila.doctor_name),
        specialty: normalizarNombre(fila.doctor_specialty),
      });
    }

    const nombreAseguradora = normalizarNombre(fila.insurance_name);
    if (!aseguradorasMap.has(nombreAseguradora)) {
      aseguradorasMap.set(nombreAseguradora, {
        coverage_percentage: aNumero(fila.insurance_coverage_percentage),
      });
    }
  }

  // 3. Insertar en PostgreSQL usando una sola transacción
  const client = await pool.connect();
  const conteo = { patients: 0, doctors: 0, insurances: 0, appointments: 0 };

  try {
    await client.query('BEGIN');

    // Insertar pacientes (ON CONFLICT = actualiza si ya existe)
    const idsPacientes = new Map();
    for (const [email, datos] of pacientesMap) {
      const res = await client.query(
        `INSERT INTO patients (name, email, phone, address)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (email) DO UPDATE
           SET name = EXCLUDED.name, phone = EXCLUDED.phone, address = EXCLUDED.address
         RETURNING id, (xmax = 0) AS nuevo`,
        [datos.name, email, datos.phone, datos.address]
      );
      idsPacientes.set(email, res.rows[0].id);
      if (res.rows[0].nuevo) conteo.patients++;
    }

    // Insertar médicos
    const idsMedicos = new Map();
    for (const [email, datos] of medicosMap) {
      const res = await client.query(
        `INSERT INTO doctors (name, email, specialty)
         VALUES ($1, $2, $3)
         ON CONFLICT (email) DO UPDATE
           SET name = EXCLUDED.name, specialty = EXCLUDED.specialty
         RETURNING id, (xmax = 0) AS nuevo`,
        [datos.name, email, datos.specialty]
      );
      idsMedicos.set(email, res.rows[0].id);
      if (res.rows[0].nuevo) conteo.doctors++;
    }

    // Insertar aseguradoras
    const idsAseguradoras = new Map();
    for (const [nombre, datos] of aseguradorasMap) {
      const res = await client.query(
        `INSERT INTO insurances (name, coverage_percentage)
         VALUES ($1, $2)
         ON CONFLICT (name) DO UPDATE SET coverage_percentage = EXCLUDED.coverage_percentage
         RETURNING id, (xmax = 0) AS nuevo`,
        [nombre, datos.coverage_percentage]
      );
      idsAseguradoras.set(nombre, res.rows[0].id);
      if (res.rows[0].nuevo) conteo.insurances++;
    }

    // Insertar citas
    for (const fila of filas) {
      const citaId = (fila.appointment_id || '').trim();
      if (!citaId) continue;

      const idPaciente    = idsPacientes.get(normalizarEmail(fila.patient_email));
      const idMedico      = idsMedicos.get(normalizarEmail(fila.doctor_email));
      const idAseguradora = idsAseguradoras.get(normalizarNombre(fila.insurance_name));

      if (!idPaciente || !idMedico || !idAseguradora) {
        throw new Error(`Faltan referencias para la cita: ${citaId}`);
      }

      const res = await client.query(
        `INSERT INTO appointments
           (appointment_id, appointment_date, patient_id, doctor_id, insurance_id,
            treatment_code, treatment_description, treatment_cost, amount_paid)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         ON CONFLICT (appointment_id) DO NOTHING
         RETURNING id`,
        [
          citaId,
          new Date(fila.appointment_date),
          idPaciente, idMedico, idAseguradora,
          (fila.treatment_code        || '').trim(),
          (fila.treatment_description || '').trim(),
          aNumero(fila.treatment_cost),
          aNumero(fila.amount_paid),
        ]
      );
      if (res.rows.length) conteo.appointments++;
    }

    await client.query('COMMIT'); // todo bien, confirmar cambios
  } catch (err) {
    await client.query('ROLLBACK'); // algo falló, deshacer todo
    throw err;
  } finally {
    client.release();
  }

  // 4. Insertar/actualizar en MongoDB — un documento por paciente con sus citas embebidas
  const citasPorPaciente = new Map();

  for (const fila of filas) {
    const emailPaciente = normalizarEmail(fila.patient_email);
    const citaId = (fila.appointment_id || '').trim();
    if (!citaId) continue;

    if (!citasPorPaciente.has(emailPaciente)) {
      citasPorPaciente.set(emailPaciente, []);
    }

    citasPorPaciente.get(emailPaciente).push({
      appointmentId:        citaId,
      date:                 new Date(fila.appointment_date),
      doctorName:           normalizarNombre(fila.doctor_name),
      doctorEmail:          normalizarEmail(fila.doctor_email),
      specialty:            normalizarNombre(fila.doctor_specialty),
      treatmentCode:        (fila.treatment_code        || '').trim(),
      treatmentDescription: (fila.treatment_description || '').trim(),
      treatmentCost:        aNumero(fila.treatment_cost),
      insuranceProvider:    normalizarNombre(fila.insurance_name),
      coveragePercentage:   aNumero(fila.insurance_coverage_percentage),
      amountPaid:           aNumero(fila.amount_paid),
    });
  }

  let historialCreados = 0;

  for (const [email, citas] of citasPorPaciente) {
    const datosPaciente = pacientesMap.get(email);
    const existente = await PatientHistory.findOne({ patientEmail: email }).lean();

    if (!existente) {
      // Crear documento nuevo
      await PatientHistory.create({
        patientEmail: email,
        patientName:  datosPaciente.name,
        appointments: citas,
      });
      historialCreados++;
    } else {
      // Solo agregar citas que no estén ya guardadas
      const idsExistentes = new Set(existente.appointments.map((c) => c.appointmentId));
      const citasNuevas   = citas.filter((c) => !idsExistentes.has(c.appointmentId));

      if (citasNuevas.length || existente.patientName !== datosPaciente.name) {
        await PatientHistory.updateOne(
          { patientEmail: email },
          {
            $set:  { patientName: datosPaciente.name },
            $push: { appointments: { $each: citasNuevas } },
          }
        );
      }
    }
  }

  return {
    patients:     conteo.patients,
    doctors:      conteo.doctors,
    insurances:   conteo.insurances,
    appointments: conteo.appointments,
    histories:    historialCreados,
  };
}

module.exports = { runMigration };
