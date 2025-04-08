$(document).ready(function () {
<<<<<<< HEAD
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
=======
  const table = $('#nutricionTable').DataTable({
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
          return '<button class="button is-small is-light">⬇️</button>';
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
  //ADICIONALES A LA TABLA//

  const logo = $('<img src="/images/manzana.png" alt="Logo" class="dt-logo">');
  const dtTopBar = $('<div class="dt-top-bar"></div>');

  // Agregar logo y mover controles
  dtTopBar.append(logo);
  $('.dataTables_length').appendTo(dtTopBar);
  $('.dataTables_filter').appendTo(dtTopBar);

  // Insertar la barra justo dentro del wrapper, antes de la tabla
  $('.dataTables_wrapper').prepend(dtTopBar);
  
  //Botones
  const btnRegistrar = $('<button class="button is-success is-small registrar-btn">Registrar paciente</button>');
  dtTopBar.append(btnRegistrar);


});
>>>>>>> develop
