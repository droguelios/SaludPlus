'use strict';

const { pool }           = require('../config/postgres');
const { PatientHistory } = require('../config/mongodb');

// Obtiene todos los médicos, con filtro opcional por especialidad
async function listDoctors({ specialty } = {}) {
  let query  = `SELECT id, name, email, specialty, created_at FROM doctors`;
  const params = [];

  if (specialty) {
    params.push(`%${specialty}%`);
    query += ` WHERE specialty ILIKE $1`; // ILIKE = búsqueda sin importar mayúsculas
  }

  query += ' ORDER BY name ASC';
  const { rows } = await pool.query(query, params);
  return rows;
}

// Busca un médico por su ID
async function getDoctorById(id) {
  const { rows } = await pool.query(
    `SELECT id, name, email, specialty, created_at FROM doctors WHERE id = $1`,
    [id]
  );
  return rows[0] || null; // devuelve null si no existe
}

// Actualiza un médico en PostgreSQL y propaga los cambios a MongoDB
async function updateDoctor(id, { name, email, specialty }) {
  // Construir la query dinámicamente según los campos enviados
  const campos = [];
  const valores = [];
  let idx = 1;

  if (name      !== undefined) { campos.push(`name = $${idx++}`);      valores.push(name); }
  if (email     !== undefined) { campos.push(`email = $${idx++}`);     valores.push(email.trim().toLowerCase()); }
  if (specialty !== undefined) { campos.push(`specialty = $${idx++}`); valores.push(specialty); }

  if (!campos.length) throw Object.assign(new Error('No hay campos para actualizar'), { status: 400 });

  valores.push(id);

  const { rows } = await pool.query(
    `UPDATE doctors SET ${campos.join(', ')} WHERE id = $${idx} RETURNING *`,
    valores
  );

  if (!rows.length) return null;

  const actualizado = rows[0];

  // Actualizar también en MongoDB — busca por email del médico y actualiza las citas embebidas
  await PatientHistory.updateMany(
    { 'appointments.doctorEmail': actualizado.email },
    {
      $set: {
        'appointments.$[cita].doctorName':  actualizado.name,
        'appointments.$[cita].doctorEmail': actualizado.email,
        'appointments.$[cita].specialty':   actualizado.specialty,
      },
    },
    {
      arrayFilters: [{ 'cita.doctorEmail': actualizado.email }],
    }
  );

  return actualizado;
}

module.exports = { listDoctors, getDoctorById, updateDoctor };
