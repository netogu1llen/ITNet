$(document).ready(function () {
  const table = $('#alumnosTable').DataTable({
    language: {
      info: "Mostrando _START_ a _END_ de _TOTAL_ registros",
      infoEmpty: "No hay registros disponibles",
      infoFiltered: "(filtrado de _MAX_ registros en total)",
      paginate: {
        previous: "Anterior",
        next: "Siguiente"
      },
      lengthMenu: "Mostrar _MENU_ registros por página",
      search: "Buscar alumno:"
    },
    ajax: '/educacion/alumnos/data',
    columns: [
      { data: 'nombre' },
      { data: 'periodoEscolar' },
      { data: 'grado' },
      { data: 'curso' },
      {
        data: 'IDExpediente',
        render: function (data) {
          return `<a class="button is-small is-info" href="/educacion/boletas?idExpediente=${data}">Consultar</a>`;
        }
      }
    ]
  });

  const logo = $('<img src="/images/educacion.png" alt="Logo" class="dt-logo">');
  const dtTopBar = $('<div class="dt-top-bar"></div>');

  dtTopBar.append(logo);
  $('.dataTables_length').appendTo(dtTopBar);
  $('.dataTables_filter').appendTo(dtTopBar);
  $('.dataTables_wrapper').prepend(dtTopBar);

});
