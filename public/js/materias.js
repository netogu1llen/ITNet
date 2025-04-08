$(document).ready(function () {
  const table = $('#materiasTable').DataTable({
    language: {
      info: "Mostrando _START_ a _END_ de _TOTAL_ registros",
      infoEmpty: "No hay registros disponibles",
      infoFiltered: "(filtrado de _MAX_ registros en total)",
      paginate: {
        previous: "Anterior",
        next: "Siguiente"
      },
      lengthMenu: "Mostrar _MENU_ registros por página",
      search: "Buscar Materia:"
    }
  });

  const logo = $('<img src="/images/materias.png" alt="Logo" class="dt-logo">');
  const btnRegistrar = $('<button class="button is-success is-small registrar-btn">Registrar Materia</button>');
  const dtTopBar = $('<div class="dt-top-bar"></div>');

  dtTopBar.append(logo);
  $('.dataTables_length').appendTo(dtTopBar);
  $('.dataTables_filter').appendTo(dtTopBar);
  dtTopBar.append(btnRegistrar);
  $('.dataTables_wrapper').prepend(dtTopBar);

  $(document).on('click', '.registrar-btn', function () {
    $('#modalRegistrar').css('display', 'flex');
  });

  $(document).on('click', '.modal-background, .delete, .button.is-cancel', function () {
    $('.modal').hide();
    $('form').trigger('reset');
  });

  $('#registrarForm').on('submit', function (e) {
    e.preventDefault();
    const datos = $(this).serialize();

    $.post('/educacion/materias/registrar', datos)
      .done(() => {
        Swal.fire('¡Materia registrada!', '', 'success').then(() => location.reload());
      })
      .fail(() => {
        Swal.fire('Error al registrar', '', 'error');
      });
  });

  $(document).on('click', '.btn-modificar', function () {
    const id = $(this).data('id');
    $.get(`/educacion/materias/obtener/${id}`, function (materia) {
      $('#modalModificar').find('[name="idMateria"]').val(materia.IDMateria);
      $('#modalModificar').find('[name="materia"]').val(materia.materia);
      $('#modalModificar').find('[name="grado"]').val(materia.grado);
      $('#modalModificar').find('[name="nvEscolar"]').val(materia.nvEscolar);
      $('#modalModificar').css('display', 'flex');
    });
  });

  $('#modificarForm').on('submit', function (e) {
    e.preventDefault();
    const datos = $(this).serialize();

    $.post('/educacion/materias/modificar', datos)
      .done(() => {
        Swal.fire('¡Materia modificada!', '', 'success').then(() => location.reload());
      })
      .fail(() => {
        Swal.fire('Error al modificar', '', 'error');
      });
  });

  $(document).on('click', '.btn-eliminar', function () {
    const id = $(this).data('id');
    Swal.fire({
      title: '¿Estás seguro?',
      text: "Esto eliminará la materia de forma lógica",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        $.post('/educacion/materias/eliminar', { id }, function () {
          Swal.fire('Eliminado', '', 'success').then(() => location.reload());
        }).fail(() => {
          Swal.fire('Error al eliminar', '', 'error');
        });
      }
    });
  });
});
