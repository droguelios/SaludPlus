// ── MIGRACIÓN CSV ─────────────────────────────────────────────────
// Llama a la API para migrar el CSV a PostgreSQL y MongoDB

async function ejecutarMigracion() {
  const btn = document.getElementById('btn-migrar');

  // Deshabilitar botón y mostrar spinner mientras carga
  btn.disabled    = true;
  btn.innerHTML   = '<span class="spinner-border spinner-border-sm"></span> Migrando...';

  // Ocultar resultados y errores anteriores
  document.getElementById('resultado-migracion').style.display = 'none';
  document.getElementById('error-migracion').style.display     = 'none';

  try {
    // Llamar al endpoint de migración
    const res   = await fetch('/api/simulacro/migrate', { method: 'POST' });
    const datos = await res.json();

    if (datos.ok) {
      // Mostrar cuántos registros se insertaron en cada tabla
      document.getElementById('mig-pacientes').textContent    = datos.result.patients;
      document.getElementById('mig-medicos').textContent      = datos.result.doctors;
      document.getElementById('mig-aseguradoras').textContent = datos.result.insurances;
      document.getElementById('mig-citas').textContent        = datos.result.appointments;
      document.getElementById('mig-historiales').textContent  = datos.result.histories;

      document.getElementById('resultado-migracion').style.display = 'block';
    } else {
      // Mostrar el error si algo salió mal
      document.getElementById('error-migracion').textContent      = 'Error: ' + datos.error;
      document.getElementById('error-migracion').style.display    = 'block';
    }

  } catch (e) {
    document.getElementById('error-migracion').textContent   = 'Error de conexión con el servidor';
    document.getElementById('error-migracion').style.display = 'block';
  } finally {
    // Volver a habilitar el botón siempre, haya o no error
    btn.disabled  = false;
    btn.innerHTML = '<i class="bi bi-upload"></i> Ejecutar Migración';
  }
}
