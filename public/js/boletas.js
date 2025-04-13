$(document).ready(function () {
  // Inicialización de la tabla con idioma y configuración personalizada
  const table = $('#boletasTable').DataTable({
    language: {
      info: 'Mostrando _START_ a _END_ de _TOTAL_ registros',
      infoEmpty: 'No hay registros disponibles',
      infoFiltered: '(filtrado de _MAX_ registros en total)',
      paginate: { previous: 'Anterior', next: 'Siguiente' },
      lengthMenu: 'Mostrar _MENU_ registros por página',
      search: 'Buscar:'
    },
    pageLength: 10,
    order: [[0, 'asc']]
  });

  // Barra superior con logo y botones (estilo Mau)
  const $logo = $('<img src="/images/boletas.png" alt="Logo" class="dt-logo">');
  const $btnRegistrar = $('<button class="button is-success is-small registrar-btn">Registrar Boleta</button>');
  const $btnVerMaterias = $('<a href="/educacion/materias" class="button is-link is-small">Ver Materias</a>');
  const $topBar = $('<div class="dt-top-bar"></div>');

  $topBar.append($logo);
  $('.dataTables_length').appendTo($topBar);
  $('.dataTables_filter').appendTo($topBar);
  $topBar.append($btnRegistrar);
  $topBar.append($btnVerMaterias);
  $('.dataTables_wrapper').prepend($topBar);

  // Mostrar modal de registro
  $(document).on('click', '.registrar-btn', function () {
    $('#modalRegistrarBoleta').css('display', 'flex');
  });

  // Cerrar modales al hacer clic en fondo oscuro, botón de cancelar o botón de cerrar
  $(document).on('click', '.modal-background, .delete, .button.is-cancel', function () {
    const $modal = $(this).closest('.modal');
    $modal.hide();

    if ($modal.attr('id') === 'modalRegistrarBoleta') {
      $('#formRegistrarBoleta').trigger('reset');
      $('#tablaMateriasSeleccionadas tbody').empty();
      $('.checkMateria').prop('checked', false);
    }

    if ($modal.attr('id') === 'modalModificarBoleta') {
      $('#modificarForm').trigger('reset');
      $('#tablaMateriasModificar tbody').empty();
    }
  });

  // Agregar materias seleccionadas al modal de registro
  $(document).on('change', '.checkMateria', function () {
    const id = $(this).val();
    const nombre = $(this).data('nombre');
    const $tbody = $('#tablaMateriasSeleccionadas tbody');

    if ($(this).is(':checked')) {
      $tbody.append(`
        <tr data-id="${id}">
          <td>${nombre}</td>
          <td>
            <input type="number" name="calificaciones[]" class="input" min="0" max="100" required>
          </td>
        </tr>
      `);
    } else {
      $tbody.find(`tr[data-id="${id}"]`).remove();
    }
  });

  // Enviar formulario para registrar boleta
  $('#formRegistrarBoleta').submit(function (e) {
    e.preventDefault();
    const periodoEscolar = $('#formRegistrarBoleta input[name="periodoEscolar"]').val();
    const IDExpediente = $('#formRegistrarBoleta input[name="IDExpediente"]').val();
    const materias = [];
    const calificaciones = [];

    $('#tablaMateriasSeleccionadas tbody tr').each(function () {
      materias.push($(this).data('id'));
      calificaciones.push($(this).find('input').val());
    });

    $.post('/educacion/boletas/registrar', {
      periodoEscolar,
      IDExpediente,
      materias,
      calificaciones
    }).done(() => {
      Swal.fire('Registrada', 'Boleta registrada correctamente', 'success')
        .then(() => location.reload());
    }).fail(() => {
      Swal.fire('Error', 'No se pudo registrar la boleta', 'error');
    });
  });

  // Abrir modal de modificación al dar clic en una fila
  $(document).on('click', 'tr.clickable-row', function () {
    const id = $(this).data('id');
    $('#modalModificarBoleta').css('display', 'flex');
    $('#tablaMateriasModificar tbody').empty();

    $.get(`/educacion/boletas/obtener/${id}`, function (data) {
      $('#modificarForm input[name="idBoleta"]').val(data.boleta.IDBoleta);
      $('#modificarForm input[name="periodoEscolar"]').val(data.boleta.periodoEscolar || '');

      data.materias.forEach((m) => {
        $('#tablaMateriasModificar tbody').append(`
          <tr data-id="${m.IDMateria}">
            <td>${m.materia}</td>
            <td>
              <input type="number" name="calificaciones[]" class="input" min="0" max="100" value="${m.calificacion}" required>
            </td>
          </tr>
        `);
      });
    });
  });

  // Enviar formulario para modificar boleta
  $('#modificarForm').submit(function (e) {
    e.preventDefault();
    const idBoleta = $('#modificarForm input[name="idBoleta"]').val();
    const periodoEscolar = $('#modificarForm input[name="periodoEscolar"]').val();
    const materias = [];
    const calificaciones = [];

    $('#tablaMateriasModificar tbody tr').each(function () {
      materias.push($(this).data('id'));
      calificaciones.push($(this).find('input').val());
    });

    $.post('/educacion/boletas/modificar', {
      idBoleta,
      periodoEscolar,
      materias,
      calificaciones
    }).done(() => {
      Swal.fire('Modificada', 'Boleta modificada correctamente', 'success')
        .then(() => location.reload());
    }).fail(() => {
      Swal.fire('Error', 'No se pudo modificar la boleta', 'error');
    });
  });

  // Eliminar boleta (confirmación y eliminación lógica)
  $(document).on('click', '.btn-eliminar', function (e) {
    e.stopPropagation(); // Evita abrir el modal al dar clic en eliminar
    const id = $(this).data('id');
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción marcará la boleta como eliminada',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar'
    }).then((result) => {
      if (result.isConfirmed) {
        $.post('/educacion/boletas/eliminar', { IDBoleta: id }, function () {
          Swal.fire('Eliminada', '', 'success').then(() => location.reload());
        }).fail(() => {
          Swal.fire('Error', 'No se pudo eliminar la boleta', 'error');
        });
      }
    });
  });
});
