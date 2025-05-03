$(document).ready(function () {
  /**
   * Inicializa DataTable con configuración en español
   */
  const table = $('#materiasTable').DataTable({
    language: {
      info: 'Mostrando _START_ a _END_ de _TOTAL_ registros',
      infoEmpty: '',
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

  // Barra superior: logo, controles y botón
  const logo = $('<img src="/images/materias.png" alt="Logo" class="dt-logo">');
  const btnRegistrar = $('<button class="button button-create registrar-btn">Registrar Materia</button>');
  const dtTopBar = $('#TopBar');

  dtTopBar.append(logo);
  $('.dataTables_length').appendTo(dtTopBar);
  $('.dataTables_filter').appendTo(dtTopBar);
  dtTopBar.append(btnRegistrar);

  /**
   * Abre el modal para registrar una nueva materia
   */
  $(document).on('click', '.registrar-btn', function () {
    $('#modalRegistrar').css('display', 'flex');
  });

  /**
   * Cierra cualquier modal abierto y resetea formularios
   */
  $(document).on('click', '.modal-background, .delete, .button.is-cancel', function () {
    $('.modal').hide();
    $('form').trigger('reset');
  });

  /**
   * Envío del formulario para registrar una nueva materia
   */
  $('#registrarForm').on('submit', function (e) {
    e.preventDefault();
    const datos = $(this).serialize();

    $.post('/educacion/materias/registrar', datos)
      .done(() => {
        Swal.fire('¡Materia registrada!', '', 'success')
          .then(() => location.reload());
      })
      .fail(() => {
        Swal.fire('Error al registrar', '', 'error');
      });
  });

  /**
   * Carga los datos de la materia seleccionada en el modal de edición
   */
  $('#materiasTable tbody').on('click', 'tr', function (e) {
    if ($(e.target).is('button') || $(e.target).is('i')) return;

    const id = $(this).data('id');

    $.get(`/educacion/materias/obtener/${id}`, function (materia) {
      $('#modalModificar').find('[name="idMateria"]').val(materia.IDMateria);
      $('#modalModificar').find('[name="materia"]').val(materia.materia);
      $('#modalModificar').find('[name="grado"]').val(materia.grado);
      $('#modalModificar').find('[name="nvEscolar"]').val(materia.nvEscolar);
      $('#modalModificar').css('display', 'flex');
    });
  });

  /**
   * Envío del formulario para modificar una materia existente
   */
  $('#modificarForm').on('submit', function (e) {
    e.preventDefault();
    const datos = $(this).serialize();

    $.post('/educacion/materias/modificar', datos)
      .done(() => {
        Swal.fire('¡Materia modificada!', '', 'success')
          .then(() => location.reload());
      })
      .fail(() => {
        Swal.fire('Error al modificar', '', 'error');
      });
  });

  /**
   * Elimina lógicamente una materia con confirmación
   */
  $(document).on('click', '.btn-eliminar', function () {
    const id = $(this).data('id');

    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esto eliminará la materia',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        $.post('/educacion/materias/eliminar', { id }, function () {
          Swal.fire('Eliminado', '', 'success')
            .then(() => location.reload());
        }).fail(() => {
          Swal.fire('Error al eliminar', '', 'error');
        });
      }
    });
  });
});
