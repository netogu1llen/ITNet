$(document).ready(function () {
  $('#nutricionTable').DataTable({
    language: {
      info: "Mostrando _START_ a _END_ de _TOTAL_ registros",
      infoEmpty: "No hay registros disponibles",
      infoFiltered: "(filtrado de _MAX_ registros en total)",
      paginate: {
        previous: "Anterior",
        next: "Siguiente"
      },
      lengthMenu: "Mostrar _MENU_ registros por página",
      search: "Buscar usuario:"
    },
    ajax: '/nutricion/data',
    columns: [
      { data: 'nombre' },
      { data: 'fecha' },
      {
        data: null,
        render: function () {
          return '<button class="button is-small is-light">⬇️</i></button>';
        }
      },
      {
        data: null,
        render: function () {
          return '<button class="button is-small is-info">Modificar</button>';
        }
      },
      {
        data: null,
        render: function () {
          return '<button class="button is-small is-danger">Eliminar</button>';
        }
      }
    ]
  });
});
