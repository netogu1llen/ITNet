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
      },
      ajax: '/educacion/materias/data',
      columns: [
        { data: 'materia' },
        { data: 'grado' },
        { data: 'nivelEscolar' },
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
          },
      ]
    });

    //Adicionales de la tabla
    const logo = $('<img src="/images/materias.png" alt="Logo" class="dt-logo">');
    const dtTopBar = $('<div class="dt-top-bar"></div>');

    // Agregar logo y mover controles
    dtTopBar.append(logo);
    $('.dataTables_length').appendTo(dtTopBar);
    $('.dataTables_filter').appendTo(dtTopBar);

     // Insertar la barra justo dentro del wrapper, antes de la tabla
    $('.dataTables_wrapper').prepend(dtTopBar);

    //Botones
    const btnRegistrar = $('<button class="button is-success is-small registrar-btn">Registrar Materia</button>');
    dtTopBar.append(btnRegistrar);
    
});