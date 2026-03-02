// ── INICIO ───────────────────────────────────────────────────────
// Carga los datos de resumen para las tarjetas del panel principal

async function cargarResumenInicio() {
  try {
    // Pedir lista de médicos a la API
    const resMedicos = await fetch('/api/doctors');
    const datosMedicos = await resMedicos.json();
    document.getElementById('total-medicos').textContent = datosMedicos.data.length;

    // Pedir reporte de ingresos a la API
    const resReporte = await fetch('/api/reports/revenue');
    const datosReporte = await resReporte.json();
    document.getElementById('total-ingresos').textContent     = '$' + datosReporte.data.totalRevenue.toFixed(2);
    document.getElementById('total-aseguradoras').textContent = datosReporte.data.byInsurance.length;

  } catch (e) {
    console.error('Error cargando resumen del inicio:', e);
  }
}
