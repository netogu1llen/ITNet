$(document).ready(function () {
    // Inicializar DataTable
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

    // Crear top bar personalizada
    const logo = $('<img src="/images/rolusuario.png" alt="Logo Rol" class="dt-logo">');
    const registrarButton = $('<button class="button button-create" style="height: 30px;">Crear Rol</button>');
    const dtTopBar = $('<div id="rolesTopBar" class="dt-top-bar"></div>'); 
    dtTopBar.append(logo);
    $('.dataTables_length').appendTo(dtTopBar);
    $('.dataTables_filter').appendTo(dtTopBar);
    $('.dataTables_wrapper').prepend(dtTopBar);
    dtTopBar.append(registrarButton);

    // ABRIR MODAL: Crear Rol
    $(document).on('click', '.button-create', function () {
        $('#modalRol').css('display', 'flex');
    });

    // CERRAR MODALES
    $(document).on('click', '.modal-background, .delete, .button.is-cancel', function () {
        $('.modal').css('display', 'none');
        $('#rolForm')[0].reset();
        $('#editarRolForm')[0].reset();
    });

    // CREAR NUEVO ROL
    $(document).on('submit', '#rolForm', function (e) {
        e.preventDefault();

        const Tipo = $('#Tipo').val().trim();
        const actividades = [];
        $('input[name="actividades"]:checked').each(function () {
            actividades.push($(this).val());
        });

        if (Tipo.length === 0) {
            Swal.fire('Error', 'El nombre del rol es obligatorio.', 'error');
            return;
        }

        if (actividades.length === 0) {
            Swal.fire('Error', 'Debe seleccionar al menos una actividad.', 'error');
            return;
        }

        const datosRol = { Tipo, actividades };

        $.ajax({
            url: '/roles/crearRol',
            method: 'POST',
            data: datosRol,
            success: function () {
                Swal.fire({
                    icon: 'success',
                    title: 'Éxito',
                    text: 'Rol creado correctamente.',
                    allowOutsideClick: false
                }).then(() => {
                    $('#rolForm')[0].reset();
                    location.reload();
                });
            },
            error: function (xhr) {
                const mensaje = xhr.responseJSON?.message || xhr.responseText || 'Error desconocido';
                Swal.fire('Error', mensaje, 'error');
            }
        });
    });

    // CLICK EN FILA PARA EDITAR ROL
    $(document).on('click', '.rol-fila', function (e) {
        if ($(e.target).is('button') || $(e.target).closest('button').length) return;
        const idRol = $(this).data('id');
        cargarDatosRol(idRol);
    });

    // CARGAR DATOS EN MODAL DE EDICIÓN
    function cargarDatosRol(idRol) {
        $.ajax({
            url: `/roles/editarRol/${idRol}`,
            method: 'GET',
            success: function (data) {
                if (!data || typeof data !== 'object') {
                    Swal.fire('Error', 'No se pudieron obtener los datos del rol.', 'error');
                    return;
                }

                const rol = data.rol;
                const privilegios = data.privilegios;

                $('#editarNombreRol').val(rol.Tipo || '');
                $('#editarIDRol').val(rol.IDRol);
                $('#modalEditarRol input[name="actividades[]"]').prop('checked', false);

                if (Array.isArray(privilegios)) {
                    privilegios.forEach(id => {
                        $(`#modalEditarRol input[name="actividades[]"][value="${id}"]`).prop('checked', true);
                    });
                }

                // Mostrar el modal estilo Bulma
                $('#modalEditarRol').css('display', 'flex');
            },
            error: function (xhr, status, error) {
                console.error("Error al obtener datos del rol:", error);
                Swal.fire('Error', 'Error al cargar los datos del rol.', 'error');
            }
        });
    }

    // ENVIAR EDICIÓN DE ROL
    $(document).on('submit', '#editarRolForm', function (e) {
        e.preventDefault();

        const IDRol = $('#editarIDRol').val();
        const Tipo = $('#editarNombreRol').val().trim();
        const actividades = [];

        $('#modalEditarRol input[name="actividades[]"]:checked').each(function () {
            actividades.push($(this).val());
        });

        if (Tipo.length === 0) {
            Swal.fire('Error', 'El nombre del rol es obligatorio.', 'error');
            return;
        }

        if (actividades.length === 0) {
            Swal.fire('Error', 'Debe seleccionar al menos una actividad.', 'error');
            return;
        }

        const datosRol = { Tipo, actividades };

        $.ajax({
            url: `/roles/editarRol/${IDRol}`,
            method: 'POST',
            data: datosRol,
            success: function () {
                Swal.fire({
                    icon: 'success',
                    title: 'Éxito',
                    text: 'Rol modificado correctamente.'
                }).then(() => {
                    location.reload();
                });
            },
            error: function (xhr) {
                const mensaje = xhr.responseJSON?.message || xhr.responseText || 'Error desconocido';
                Swal.fire('Error', mensaje, 'error');
            }
        });
    });
});

