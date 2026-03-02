// ── HISTORIAL DE PACIENTE ─────────────────────────────────────────

async function cargarHistorial() {
  const email = document.getElementById('email-paciente').value.trim();
  if (!email) { alert('Por favor ingresa un email'); return; }

  try {
    const res   = await fetch(`/api/patients/${encodeURIComponent(email)}/history`);
    const datos = await res.json();

    if (!datos.ok) {
      alert('Paciente no encontrado');
      document.getElementById('resultado-historial').style.display = 'none';
      return;
    }

    const { patientName, patientEmail, appointments, summary } = datos.data;

    // Mostrar info del paciente
    document.getElementById('hist-nombre').textContent        = patientName;
    document.getElementById('hist-email').textContent         = patientEmail;
    document.getElementById('hist-total-citas').textContent   = summary.totalAppointments;
    document.getElementById('hist-total-gastado').textContent = '$' + summary.totalSpent.toFixed(2);
    document.getElementById('hist-especialidad').textContent  = summary.mostFrequentSpecialty || '—';

    // Tabla de citas
    document.getElementById('tabla-historial').innerHTML = appointments.map(c => `
      <tr>
        <td style="color:#64748b">${new Date(c.date).toLocaleDateString('es-CO')}</td>
        <td style="font-weight:600">${c.doctorName}</td>
        <td><span class="badge-esp">${c.specialty}</span></td>
        <td style="color:#64748b;font-size:0.85rem">${c.treatmentDescription}</td>
        <td>$${c.treatmentCost.toFixed(2)}</td>
        <td style="color:#10b981;font-weight:600">$${c.amountPaid.toFixed(2)}</td>
        <td style="color:#64748b">${c.insuranceProvider}</td>
      </tr>
    `).join('');

    document.getElementById('resultado-historial').style.display = 'block';

  } catch (e) {
    alert('Error al buscar el historial');
  }
}
