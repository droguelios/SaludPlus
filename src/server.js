'use strict';

const env            = require('./config/env');
const { initSchema } = require('./config/postgres');
const { connectMongo } = require('./config/mongodb');
const app            = require('./app');

async function iniciar() {
  // Conectar a las dos bases de datos antes de aceptar peticiones
  await connectMongo();
  await initSchema();

  // Encender el servidor HTTP
  app.listen(env.puerto, () => {
    console.log(`[Servidor] SaludPlus API corriendo en el puerto ${env.puerto}`);
  });
}

// Arrancar y mostrar error si algo falla al inicio
iniciar().catch((err) => {
  console.error('[Servidor] Error fatal al iniciar:', err.message);
  process.exit(1);
});
