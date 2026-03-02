// ── NAVEGACIÓN ───────────────────────────────────────────────────
// Muestra la sección clickeada y oculta las demás

function mostrarSeccion(id) {
  // Ocultar todas las secciones
  document.querySelectorAll('.seccion').forEach(s => s.classList.remove('activa'));

  // Quitar resaltado de todos los links del menú
  document.querySelectorAll('.sidebar a').forEach(a => a.classList.remove('activo'));

  // Mostrar solo la sección que se eligió
  document.getElementById(id).classList.add('activa');

  // Resaltar el link correspondiente
  document.getElementById('link-' + id).classList.add('activo');

  // Cargar los datos de esa sección automáticamente
  if (id === 'inicio')  cargarResumenInicio();
  if (id === 'medicos') cargarMedicos();
  if (id === 'reporte') cargarReporte();
}
