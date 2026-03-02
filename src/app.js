'use strict';

const express = require('express');
const path    = require('path');

// Importar todas las rutas
const rutasMedicos    = require('./routes/doctors');
const rutasReportes   = require('./routes/reports');
const rutasPacientes  = require('./routes/patients');
const rutasSimulacro  = require('./routes/simulacro');

const app = express();

// Middleware para leer JSON en el body de las peticiones
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Servir la carpeta public como archivos estáticos (HTML, CSS, JS del frontend)
app.use(express.static(path.join(__dirname, '..', 'public')));

// Registrar las rutas con su prefijo
app.use('/api/doctors',   rutasMedicos);
app.use('/api/reports',   rutasReportes);
app.use('/api/patients',  rutasPacientes);
app.use('/api/simulacro', rutasSimulacro);

// Ruta de salud — para verificar que el servidor está corriendo
app.get('/health', (_req, res) => res.json({ ok: true, servicio: 'saludplus-api' }));

// Si la ruta no existe, devolver 404
app.use((_req, res) => res.status(404).json({ ok: false, error: 'Ruta no encontrada' }));

// Manejador global de errores — captura cualquier error de las rutas
app.use((err, _req, res, _next) => {
  console.error('[Error]', err.message);
  const status = err.status || 500;
  res.status(status).json({
    ok: false,
    error: status === 500 ? 'Error interno del servidor' : err.message,
  });
});

module.exports = app;
