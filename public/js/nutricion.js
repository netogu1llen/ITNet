$(document).ready(function () {
    $('#nutricionTable2').DataTable({
      ajax: '/nutricion/expediente/data',
      language: {
        url: "/js/dataTablesLang/es-ES.json"
      },
      columns: [
        { data: 'noSesion', title: 'No. Sesión' }, // Asegúrate de que las claves coincidan con las del backend
        { data: 'fecha', title: 'Fecha' },
        {
          data: null,
          render: function () {
            return '<button class="button is-small is-light"><i class="fas fa-download"></i></button>';
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