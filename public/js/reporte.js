// ── REPORTE DE INGRESOS ───────────────────────────────────────────

async function cargarReporte() {
  const inicio = document.getElementById('fecha-inicio').value;
  const fin    = document.getElementById('fecha-fin').value;

  let url = '/api/reports/revenue';
  const params = [];
  if (inicio) params.push('startDate=' + inicio);
  if (fin)    params.push('endDate='   + fin);
  if (params.length) url += '?' + params.join('&');

  try {
    const res   = await fetch(url);
    const datos = await res.json();
    const { totalRevenue, byInsurance } = datos.data;

    // Mostrar total general
    document.getElementById('reporte-total').textContent = '$' + totalRevenue.toFixed(2);

    // Crear fila por cada aseguradora con barra de progreso
    document.getElementById('tabla-reporte').innerHTML = byInsurance.map(item => {
      const porcentaje = totalRevenue > 0
        ? ((item.total / totalRevenue) * 100).toFixed(1) : 0;
      return `
        <tr>
          <td style="font-weight:600">${item.insurance}</td>
          <td style="color:#10b981;font-weight:700">$${item.total.toFixed(2)}</td>
          <td style="color:#64748b">${item.appointmentCount}</td>
          <td style="min-width:160px">
            <div class="barra-wrap">
              <div class="barra-fill" style="width:${porcentaje}%">${porcentaje}%</div>
            </div>
          </td>
        </tr>
      `;
    }).join('');

  } catch (e) {
    alert('Error al cargar el reporte');
  }
}
