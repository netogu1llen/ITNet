$(document).ready(function () {
    // Inicializar DataTable para la tabla de roles
    const table = $('#rolTable').DataTable({
        language: {
            info: "Mostrando _START_ a _END_ de _TOTAL_ registros",
            infoEmpty: "No hay registros disponibles",
            infoFiltered: "(filtrado de _MAX_ registros en total)",
            paginate: {
                previous: "Anterior",
                next: "Siguiente"
            },
            lengthMenu: "Mostrar _MENU_ registros por página",
            search: "Buscar rol:"
        },
        pageLength: 10,
        lengthMenu: [5, 10, 25, 50],
        order: [[0, 'asc']]
    });

    // Crear barra superior personalizada con ID
    const logo = $('<img src="/images/rolusuario.png" alt="Logo Rol" class="dt-logo">');
    const registrarButton = $('<button class="button button-create" style="height: 30px;">Crear Rol</button>');
    const dtTopBar = $('<div id="rolesTopBar" class="dt-top-bar"></div>'); 

    // Ensamblar la barra topbar
    dtTopBar.append(logo);
    $('.dataTables_length').appendTo(dtTopBar);
    $('.dataTables_filter').appendTo(dtTopBar);
    $('.dataTables_wrapper').prepend(dtTopBar);
    dtTopBar.append(registrarButton);

    // ABRIR MODAL: Crear Rol
    $(document).on('click', '.button-create', function () {
        $('#modalRol').css('display', 'flex');
    });

    // CERRAR MODAL: fondo, X o cancelar
    $(document).on('click', '.modal-background, .delete, .button.is-cancel', function () {
        $('#modalRol').css('display', 'none');
        $('#rolForm')[0].reset();
    });

    // ENVIAR FORMULARIO: Crear nuevo rol
    $(document).on('submit', '#rolForm', function (e) {
        e.preventDefault();

        const Tipo = $('#Tipo').val().trim();
        const actividades = [];
        $('input[name="actividades"]:checked').each(function () {
            actividades.push($(this).val());
        });

        // Validaciones
        if (Tipo.length === 0) {
            Swal.fire('Error', 'El nombre del rol es obligatorio.', 'error');
            return;
        }

        if (actividades.length === 0) {
            Swal.fire('Error', 'Debe seleccionar al menos una actividad.', 'error');
            return;
        }

        const datosRol = {
	    Tipo,
            actividades
        };

        // Enviar datos por AJAX
        $.ajax({
            url: '/roles/crearRol',
            method: 'POST',
            data: datosRol,
            success: function () {
                Swal.fire('Éxito', 'Rol creado correctamente.', 'success').then(() => {
                    location.reload();
                });
            },
            error: function () {
                Swal.fire('Error', 'Error al crear el rol.', 'error');
            }
        });
    });
});

