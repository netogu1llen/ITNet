$(document).ready(function () {
  $('#nutricionTable').DataTable({
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
