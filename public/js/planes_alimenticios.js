$(document).ready(function () {
    $('#planesAlimenticiosTable').DataTable({
      ajax: '/nutricion/planes-alimenticios/data',
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
            return '<button class="button is-small is-danger">Eliminar</button>';
          }
        }
      ]
    });
  });
  