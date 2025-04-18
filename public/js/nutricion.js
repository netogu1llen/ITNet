$(document).ready(function () {
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
      search: "Buscar paciente:"
    },
    ajax: '/nutricion/data',
    columns: [
      { data: 'nombrePaciente' },
      { data: 'numSesion' },
      { data: 'fecha' },
      {
        data: 'id',
        render: function (data) {
          return `<a class="button is-small is-light" href="/descargar/${data}">⬇️</a>`;
        }
      },
      {
        data: 'id',
        render: function (data) {
          return `<button class="button is-small is-info btn-modificar" data-id="${data}">Modificar</button>`;
        }
      },
      {
        data: 'id',
        render: function (data) {
          return `<button class="button is-small is-danger btn-eliminar" data-id="${data}">Eliminar</button>`;
        }
      }
    ]
  });

  // TopBar
  const logo = $('<img src="/images/manzana.png" alt="Logo" class="dt-logo">');
  const dtTopBar = $('<div class="dt-top-bar"></div>');
  dtTopBar.append(logo);
  $('.dataTables_length').appendTo(dtTopBar);
  $('.dataTables_filter').appendTo(dtTopBar);
  $('#nutricionTopBar').append(dtTopBar);

  // Botón registrar que redirige a otra ruta
  const btnRegistrar = $('<a href="/historiaClinica" class="button is-success is-small">Registrar paciente</a>');
  dtTopBar.append(btnRegistrar);

  // Abrir modal de modificar y rellenar
  $(document).on('click', '.btn-modificar', function () {
    const rowData = table.row($(this).closest('tr')).data();

    $('#idConsulta').val(rowData.id);
    $('#numSesionMod').val(rowData.numSesion);
    $('#fechaMod').val(rowData.fecha);

    $('#modalModificar').addClass('is-active').show();
  });

  // Cerrar modal al hacer clic en X, fondo o botón cancelar
  $(document).on('click', '.modal .delete, .modal .is-cancel, .modal-background', function () {
    $(this).closest('.modal').removeClass('is-active').hide();
  });

  // Puedes agregar aquí las funciones AJAX para enviar los formularios si quieres
});
