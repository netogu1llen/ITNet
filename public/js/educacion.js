$(document).ready(function () {
  // Inicializa DataTable con idioma personalizado y AJAX
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

  // Redirige a la vista de boletas al dar clic en una fila
  $('#alumnosTable tbody').on('click', 'tr', function () {
    const data = table.row(this).data();
    if (data && data.IDExpediente) {
      window.location.href = `/educacion/boletas?idExpediente=${data.IDExpediente}`;
    }
  });

  // Barra superior personalizada
  const logo = $('<img src="/images/educacion.png" alt="Logo" class="dt-logo">');
  const dtTopBar = $('<div class="dt-top-bar exp-psicologico-wide"></div>');

  dtTopBar.append(logo);
  $('.dataTables_length').appendTo(dtTopBar);
  $('.dataTables_filter').appendTo(dtTopBar);

  // Botón "Ver Materias" 
  const btnMaterias = $(
    '<a href="/educacion/materias" class="button is-success is-small ml-2">Ver Materias</a>'
  );
  dtTopBar.append(btnMaterias);

  // Inserta la barra superior antes de la tabla
  $('.dataTables_wrapper').prepend(dtTopBar);
});
