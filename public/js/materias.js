$(document).ready(function () {
  /** Inicialización de la tabla DataTable **/
  const table = $('#materiasTable').DataTable({
    language: {
      info: 'Mostrando _START_ a _END_ de _TOTAL_ registros',
      infoEmpty: 'No hay registros disponibles',
      infoFiltered: '(filtrado de _MAX_ registros en total)',
      paginate: {
        previous: 'Anterior',
        next: 'Siguiente'
      },
      lengthMenu: 'Mostrar _MENU_ registros por página',
      search: 'Buscar materia:'
    },
    pageLength: 10,
    order: [[0, 'asc']]
  });

  /** Construcción de barra superior como en otras vistas **/
  const logo = $('<img src="/images/materias.png" alt="Logo" class="dt-logo">');
  const btnRegistrar = $(
    '<button class="button is-success is-small registrar-btn">Registrar Materia</button>'
  );
  const dtTopBar = $('<div class="dt-top-bar exp-psicologico-wide"></div>');

  dtTopBar.append(logo);
  $('.dataTables_length').appendTo(dtTopBar);
  $('.dataTables_filter').appendTo(dtTopBar);
  dtTopBar.append(btnRegistrar);
  $('.dataTables_wrapper').prepend(dtTopBar);

  /** Mostrar el modal de registro **/
  $(document).on('click', '.registrar-btn', function () {
    $('#modalRegistrar').css('display', 'flex');
  });

  /** Ocultar modales y resetear formularios **/
  $(document).on('click', '.modal-background, .delete, .button.is-cancel', function () {
    $('.modal').hide();
    $('form').trigger('reset');
  });

  /** Envío del formulario para registrar materia **/
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

  /** Al hacer clic en una fila, abrir el modal de modificación **/
  $('#materiasTable tbody').on('click', 'tr', function () {
    const id = $(this).data('id');
    $.get(`/educacion/materias/obtener/${id}`, function (materia) {
      $('#modalModificar').find('[name="idMateria"]').val(materia.IDMateria);
      $('#modalModificar').find('[name="materia"]').val(materia.materia);
      $('#modalModificar').find('[name="grado"]').val(materia.grado);
      $('#modalModificar').find('[name="nvEscolar"]').val(materia.nvEscolar);
      $('#modalModificar').css('display', 'flex');
    });
  });

  /** Envío del formulario para modificar materia **/
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

  /** Eliminación lógica de materia con confirmación **/
  $(document).on('click', '.btn-eliminar', function () {
    const id = $(this).data('id');
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esto eliminará la materia de forma lógica',
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
