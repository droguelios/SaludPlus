'use strict';

const { Pool } = require('pg');
const env = require('./env');

// Pool de conexiones a PostgreSQL (reutiliza conexiones en vez de abrir una nueva cada vez)
const pool = new Pool({
  host:     env.pg.host,
  port:     env.pg.port,
  database: env.pg.database,
  user:     env.pg.user,
  password: env.pg.password,
  max: 20, // máximo 20 conexiones simultáneas
});

pool.on('error', (err) => {
  console.error('[PostgreSQL] Error inesperado:', err.message);
});

// Crea las tablas si no existen (se puede correr varias veces sin problema)
async function initSchema() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN'); // inicio de transacción

    // Tabla de pacientes
    await client.query(`
      CREATE TABLE IF NOT EXISTS patients (
        id         SERIAL PRIMARY KEY,
        name       VARCHAR(255)        NOT NULL,
        email      VARCHAR(255) UNIQUE NOT NULL,
        phone      VARCHAR(50),
        address    TEXT,
        created_at TIMESTAMPTZ         NOT NULL DEFAULT NOW()
      );
    `);

    // Tabla de médicos
    await client.query(`
      CREATE TABLE IF NOT EXISTS doctors (
        id         SERIAL PRIMARY KEY,
        name       VARCHAR(255)        NOT NULL,
        email      VARCHAR(255) UNIQUE NOT NULL,
        specialty  VARCHAR(255)        NOT NULL,
        created_at TIMESTAMPTZ         NOT NULL DEFAULT NOW()
      );
    `);

    // Tabla de aseguradoras
    await client.query(`
      CREATE TABLE IF NOT EXISTS insurances (
        id                  SERIAL PRIMARY KEY,
        name                VARCHAR(255) UNIQUE NOT NULL,
        coverage_percentage NUMERIC(5,2)        NOT NULL,
        created_at          TIMESTAMPTZ         NOT NULL DEFAULT NOW()
      );
    `);

    // Tabla de citas — relaciona paciente, médico y aseguradora
    await client.query(`
      CREATE TABLE IF NOT EXISTS appointments (
        id                    SERIAL PRIMARY KEY,
        appointment_id        VARCHAR(100) UNIQUE NOT NULL,
        appointment_date      TIMESTAMPTZ         NOT NULL,
        patient_id            INTEGER NOT NULL REFERENCES patients(id)   ON DELETE RESTRICT,
        doctor_id             INTEGER NOT NULL REFERENCES doctors(id)    ON DELETE RESTRICT,
        insurance_id          INTEGER NOT NULL REFERENCES insurances(id) ON DELETE RESTRICT,
        treatment_code        VARCHAR(50)  NOT NULL,
        treatment_description TEXT         NOT NULL,
        treatment_cost        NUMERIC(12,2) NOT NULL,
        amount_paid           NUMERIC(12,2) NOT NULL,
        created_at            TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      );
    `);

    // Índices para acelerar las búsquedas más comunes
    await client.query(`CREATE INDEX IF NOT EXISTS idx_patients_email            ON patients(email);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_doctors_specialty         ON doctors(specialty);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_appointments_date         ON appointments(appointment_date);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_appointments_insurance_id ON appointments(insurance_id);`);

    await client.query('COMMIT'); // confirmar todos los cambios
    console.log('[PostgreSQL] Tablas listas.');
  } catch (err) {
    await client.query('ROLLBACK'); // si algo falla, deshace todo
    throw err;
  } finally {
    client.release(); // devuelve la conexión al pool
  }
}

module.exports = { pool, initSchema };
