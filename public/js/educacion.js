$(document).ready(function () {
  /**
   * Inicializa DataTable para listar alumnos con configuración personalizada
   */
  const table = $('#alumnosTable').DataTable({
    language: {
      emptyTable: 'No se encontraron Alumnos',
      zeroRecords: 'No hay registros disponibles',
      info: 'Mostrando _START_ a _END_ de _TOTAL_ registros',
      infoEmpty: 'No hay registros disponibles',
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
   * Redirige a la vista de boletas al hacer clic en una fila
   */
  $('#alumnosTable tbody').on('click', 'tr', function () {
    const data = table.row(this).data();
    if (data && data.IDExpediente) {
      window.location.href = `/educacion/boletas?idExpediente=${data.IDExpediente}`;
    }
  });

  /**
   * Inserta barra superior con logo y controles
   */
  const logo = $('<img src="/images/educacion.png" alt="Logo" class="dt-logo">');
  const dtTopBar = $('<div class="dt-top-bar exp-psicologico-wide"></div>');

  dtTopBar.append(logo);
  $('.dataTables_length').appendTo(dtTopBar);
  $('.dataTables_filter').appendTo(dtTopBar);

  /**
   * Botón para ver materias
   */
  const btnMaterias = $(
    '<a href="/educacion/materias" class="button button-create ml-2">Ver Materias</a>'
  );
  dtTopBar.append(btnMaterias);

  // Inserta barra completa antes de la tabla
  $('.dataTables_wrapper').prepend(dtTopBar);
});
