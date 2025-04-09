$(document).ready(function () {
  const table = $('#boletasTable').DataTable({
    language: {
      info: "Mostrando _START_ a _END_ de _TOTAL_ registros",
      infoEmpty: "No hay registros disponibles",
      infoFiltered: "(filtrado de _MAX_ registros en total)",
      paginate: { previous: "Anterior", next: "Siguiente" },
      lengthMenu: "Mostrar _MENU_ registros por página",
      search: "Buscar boleta:"
    },
    pageLength: 10,
    order: [[0, 'asc']]
  });

  // Barra superior personalizada (como en materias)
  const logo = $('<img src="/images/educacion.png" alt="Logo" class="dt-logo">');
  const btnRegistrar = $('<button class="button is-success is-small registrar-btn">Registrar Boleta</button>');
  const btnMaterias = $('<a href="/educacion/materias" class="button is-link is-small">Ver Materias</a>');
  const dtTopBar = $('<div class="dt-top-bar"></div>');

  dtTopBar.append(logo);
  $('.dataTables_length').appendTo(dtTopBar);
  $('.dataTables_filter').appendTo(dtTopBar);
  dtTopBar.append(btnMaterias).append(btnRegistrar);
  $('.dataTables_wrapper').prepend(dtTopBar);

  // Abrir modal registrar
  $(document).on('click', '.registrar-btn', function () {
    $('#modalRegistrarBoleta').css('display', 'flex');
  });

  // Cerrar modales
  $(document).on('click', '.modal-background, .delete, .button.is-cancel', function () {
    $('.modal').hide();
    $('form').trigger('reset');
    $('#tablaMateriasSeleccionadas tbody').empty();
    $('#tablaMateriasModificar tbody').empty();
    $('.checkMateria').prop('checked', false);
  });

  // Agregar materias
  $(document).on('change', '.checkMateria', function () {
    const id = $(this).val();
    const nombre = $(this).data('nombre');
    const tbody = $('#tablaMateriasSeleccionadas tbody');

    if ($(this).is(':checked')) {
      tbody.append(`
        <tr data-id="${id}">
          <td>${nombre}</td>
          <td><input type="number" name="calificaciones[]" class="input" min="0" max="100" required></td>
        </tr>
      `);
    } else {
      tbody.find(`tr[data-id="${id}"]`).remove();
    }
  });

  // Registrar boleta
  $('#formRegistrarBoleta').submit(function (e) {
    e.preventDefault();
    const periodoEscolar = $('input[name="periodoEscolar"]').val();
    const IDExpediente = $('input[name="IDExpediente"]').val();
    const materias = [];
    const calificaciones = [];

    $('#tablaMateriasSeleccionadas tbody tr').each(function () {
      materias.push($(this).data('id'));
      calificaciones.push($(this).find('input').val());
    });

    if (materias.length === 0) {
      return Swal.fire('Advertencia', 'Selecciona al menos una materia', 'warning');
    }

    $.post('/educacion/boletas/registrar', { periodoEscolar, IDExpediente, materias, calificaciones }, function () {
      Swal.fire('Registrada', 'Boleta registrada correctamente', 'success').then(() => location.reload());
    }).fail(() => {
      Swal.fire('Error', 'No se pudo registrar la boleta', 'error');
    });
  });

  // Modificar boleta
  $(document).on('click', '.btn-modificar', function () {
    const id = $(this).data('id');
    $('#modalModificarBoleta').show();
    $('#tablaMateriasModificar tbody').empty();

    $.get(`/educacion/boletas/obtener/${id}`, function (data) {
      $('#modificarForm input[name="idBoleta"]').val(data.boleta.IDBoleta);
      $('#modificarForm input[name="periodoEscolar"]').val(data.boleta.periodoEscolar);

      data.materias.forEach(m => {
        $('#tablaMateriasModificar tbody').append(`
          <tr data-id="${m.IDMateria}">
            <td>${m.materia}</td>
            <td><input type="number" name="calificaciones[]" class="input" min="0" max="100" value="${m.calificacion}" required></td>
          </tr>
        `);
      });
    });
  });

  // Guardar modificación
  $('#modificarForm').submit(function (e) {
    e.preventDefault();
    const idBoleta = $('input[name="idBoleta"]').val();
    const periodoEscolar = $('input[name="periodoEscolar"]').val();
    const materias = [];
    const calificaciones = [];

    $('#tablaMateriasModificar tbody tr').each(function () {
      materias.push($(this).data('id'));
      calificaciones.push($(this).find('input').val());
    });

    $.post('/educacion/boletas/modificar', { idBoleta, periodoEscolar, materias, calificaciones }, function () {
      Swal.fire('Modificada', 'Boleta modificada correctamente', 'success').then(() => location.reload());
    }).fail(() => {
      Swal.fire('Error', 'No se pudo modificar la boleta', 'error');
    });
  });

  // Eliminar boleta (eliminado lógico)
  $(document).on('click', '.btn-eliminar', function () {
    const id = $(this).data('id');
    Swal.fire({
      title: '¿Estás segura?',
      text: 'Esta acción marcará la boleta como eliminada',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar'
    }).then((r) => {
      if (r.isConfirmed) {
        $.post('/educacion/boletas/eliminar', { id: id }, function () {
          Swal.fire('Eliminada', '', 'success').then(() => location.reload());
        }).fail(() => {
          Swal.fire('Error', 'No se pudo eliminar la boleta', 'error');
        });
      }
    });
  });
});
