/**
 * Configuración del DataTable para la vista de alumnos del centro educativo.
 * Se hace clicable cada fila para redirigir a las boletas del alumno.
 */

$(document).ready(function () {
  /** @constant {object} table - Instancia de DataTable */
  const table = $('#alumnos-table').DataTable({
    language: {
      info: 'Mostrando _START_ a _END_ de _TOTAL_ registros',
      infoEmpty:'',
      infoFiltered: '(filtrado de _MAX_ registros en total)',
      paginate: {
        previous: 'Anterior',
        next: 'Siguiente'
      },
      lengthMenu: 'Mostrar _MENU_ registros por página',
      search: 'Buscar alumno:'
    },
    ajax: '/educacion/alumnos/data',
    columns: [
      { data: 'nombre' },
      { data: 'periodoEscolar' },
      { data: 'grado' },
      { data: 'nvEscolar' }
    ]
  });

  /**
   * Crea dinámicamente la barra superior con logo, filtros y búsqueda.
   */
  const logo = $('<img src="/images/educacion.png" alt="Logo" class="dt-logo">');
  const topBar = $('<div class="dt-top-bar exp-psicologico-wide" id="top-bar"></div>');

  topBar.append(logo);
  $('.dataTables_length').appendTo(topBar);
  $('.dataTables_filter').appendTo(topBar);
  $('.dataTables_wrapper').prepend(topBar);

  /**
   * Hace clicable cada fila para redirigir a la vista de boletas.
   */
  $('#alumnos-table tbody').on('click', 'tr', function () {
    const rowData = table.row(this).data();
    if (rowData && rowData.IDExpediente) {
      window.location.href = `/educacion/boletas?idExpediente=${rowData.IDExpediente}`;
    }
  });
});
