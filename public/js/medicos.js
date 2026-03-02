// ── MÉDICOS ──────────────────────────────────────────────────────

// Carga la lista de médicos desde la API y la muestra en la tabla
async function cargarMedicos() {
  const especialidad = document.getElementById('filtro-especialidad').value;
  const url = especialidad ? `/api/doctors?specialty=${especialidad}` : '/api/doctors';

  try {
    const res   = await fetch(url);
    const datos = await res.json();
    const tbody = document.getElementById('tabla-medicos');

    if (!datos.data.length) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px;color:#94a3b8">No se encontraron médicos</td></tr>';
      return;
    }

    // Crear una fila por cada médico
    tbody.innerHTML = datos.data.map(m => `
      <tr>
        <td style="color:#94a3b8;font-size:0.8rem">#${m.id}</td>
        <td style="font-weight:600">${m.name}</td>
        <td style="color:#64748b">${m.email}</td>
        <td><span class="badge-esp">${m.specialty}</span></td>
        <td style="color:#64748b">${new Date(m.created_at).toLocaleDateString('es-CO')}</td>
        <td>
          <button class="btn-outline"
            onclick="abrirEditar(${m.id}, '${m.name}', '${m.email}', '${m.specialty}')">
            <i class="bi bi-pencil"></i> Editar
          </button>
        </td>
      </tr>
    `).join('');

  } catch (e) {
    document.getElementById('tabla-medicos').innerHTML =
      '<tr><td colspan="6" style="text-align:center;color:#ef4444;padding:30px">Error al cargar médicos</td></tr>';
  }
}

// Abre el modal con los datos del médico seleccionado
function abrirEditar(id, nombre, email, especialidad) {
  document.getElementById('editar-id').value           = id;
  document.getElementById('editar-nombre').value       = nombre;
  document.getElementById('editar-email').value        = email;
  document.getElementById('editar-especialidad').value = especialidad;
  document.getElementById('modalEditar').classList.add('abierto');
}

// Cierra el modal
function cerrarModal() {
  document.getElementById('modalEditar').classList.remove('abierto');
}

// Guarda los cambios del médico llamando al endpoint PUT
async function guardarMedico() {
  const id           = document.getElementById('editar-id').value;
  const nombre       = document.getElementById('editar-nombre').value;
  const email        = document.getElementById('editar-email').value;
  const especialidad = document.getElementById('editar-especialidad').value;

  try {
    const res   = await fetch(`/api/doctors/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: nombre, email, specialty: especialidad })
    });
    const datos = await res.json();

    if (datos.ok) {
      cerrarModal();
      cargarMedicos(); // recargar la tabla
      alert('¡Médico actualizado correctamente!');
    } else {
      alert('Error: ' + datos.error);
    }
  } catch (e) {
    alert('Error al guardar los cambios');
  }
}
