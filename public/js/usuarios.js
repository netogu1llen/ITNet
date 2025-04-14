$(document).ready(function () {
    // Inicializar DataTable para la tabla de usuarios
    const table = $('#miEquipoTable').DataTable({
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
        pageLength: 10,
        lengthMenu: [5, 10, 25, 50],
        order: [[0, 'asc']]
    });

    // Crear la barra superior personalizada
    const logo = $('<img src="/images/usuarios.png" alt="Logo Usuarios" class="dt-logo">');
    const registrarButton = $('<button class="button button-create" style="height: 30px;">Registrar Usuario</button>');
    const dtTopBar = $('<div class="dt-top-bar"></div>');

    // Agregar elementos a la barra superior
    dtTopBar.append(logo);
    $('.dataTables_length').appendTo(dtTopBar);
    $('.dataTables_filter').appendTo(dtTopBar);
    $('.dataTables_wrapper').prepend(dtTopBar);
    dtTopBar.append(registrarButton);

    // REGISTRAR USUARIO //
    // Evento para abrir el modal de registrar usuario
    $(document).on('click', '.button-create', function () {
        $('#modalRegistrar').css('display', 'flex');
    });

    // Evento para cerrar el modal de registrar usuario
    $(document).on('click', '.modal-background, .delete, .button.is-cancel', function () {
        $('#modalRegistrar').css('display', 'none');
        $('#registrarForm')[0].reset();
    });

    // Evento para enviar los datos del formulario y registrar un nuevo usuario
    $(document).on('submit', '#registrarForm', function (e) {
        e.preventDefault();

        const nombres = $('input[name="nombresReg"]').val().trim();
        const apellidoP = $('input[name="apellidoPReg"]').val().trim();
        const apellidoM = $('input[name="apellidoMReg"]').val().trim();
        const correo = $('input[name="correoReg"]').val().trim();
        const fechaNacimiento = $('input[name="fechaNacimientoReg"]').val().trim();

        // Validaciones
        if (!/^[A-Za-z\s]+$/.test(nombres)) {
            Swal.fire('Error', 'El nombre solo puede contener letras y espacios.', 'error');
            return;
        }

        if (!/^[A-Za-z\s]+$/.test(apellidoP)) {
            Swal.fire('Error', 'El apellido paterno solo puede contener letras y espacios.', 'error');
            return;
        }

        if (apellidoM && !/^[A-Za-z\s]*$/.test(apellidoM)) {
            Swal.fire('Error', 'El apellido materno solo puede contener letras y espacios.', 'error');
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
            Swal.fire('Error', 'Por favor ingrese un correo electrónico válido.', 'error');
            return;
        }

        if (!fechaNacimiento) {
            Swal.fire('Error', 'La fecha de nacimiento es obligatoria.', 'error');
            return;
        }

        const datosUsuario = {
            nombres,
            apellidoP,
            apellidoM,
            correo,
            fechaNacimiento
        };

        // Realiza una solicitud AJAX para registrar el usuario
        $.ajax({
            url: '/usuarios/registrar',
            method: 'POST',
            data: datosUsuario,
            success: function () {
                Swal.fire('Éxito', 'Usuario registrado correctamente.', 'success').then(() => {
                    location.reload();
                });
            },
            error: function () {
                Swal.fire('Error', 'Error al registrar el usuario.', 'error');
            }
        });
    });

    // MODIFICAR USUARIO //
    // Evento para abrir el modal MODIFICAR y cargar los datos del usuario
    $(document).on('click', '.btn-modificar', function () {
        const idUsuario = $(this).data('id');

        // Realiza una solicitud AJAX para obtener los datos del usuario
        $.ajax({
            url: `/usuarios/modificar/${idUsuario}`,
            method: 'GET',
            success: function (usuario) {
                // Validar los datos recibidos antes de cargarlos en el modal
                if (!usuario.nombres || !/^[A-Za-z\s]+$/.test(usuario.nombres)) {
                    Swal.fire('Error', 'El nombre recibido es inválido.', 'error');
                    return;
                }

                if (!usuario.apellidoP || !/^[A-Za-z\s]+$/.test(usuario.apellidoP)) {
                    Swal.fire('Error', 'El apellido paterno recibido es inválido.', 'error');
                    return;
                }

                // Carga los datos en el modal
                $('input[name="nombresMod"]').val(usuario.nombres);
                $('input[name="apellidoPMod"]').val(usuario.apellidoP);
                $('input[name="apellidoMMod"]').val(usuario.apellidoM || '');
                $('input[name="correoMod"]').val(usuario.correo);
                $('input[name="fechaNacimientoMod"]').val(usuario.fechaNacimiento.split('T')[0]);

                // Muestra el modal
                $('#modalModificar').css('display', 'flex');
                $('#modificarForm').attr('action', `/usuarios/modificar/${idUsuario}`);
            },
            error: function () {
                Swal.fire('Error', 'Error al cargar los datos del usuario.', 'error');
            }
        });
    });

    // Evento para cerrar el modal al hacer clic en el fondo oscuro
    $(document).on('click', '.modal-background', function () {
        cerrarModalModificar();
    });

    // Evento para cerrar el modal al hacer clic en el botón de cierre (la "X")
    $(document).on('click', '.delete', function () {
        cerrarModalModificar();
    });

    // Evento para cerrar el modal al hacer clic en el botón "Cancelar"
    $(document).on('click', '.button.is-cancel', function () {
        cerrarModalModificar();
    });

    // Define la función para cerrar el modal
    window.cerrarModalModificar = function () {
        $('#modalModificar').css('display', 'none');
        $('#modificarForm')[0].reset();
    };

    // Evento para enviar los datos del formulario y modificar el usuario
    $(document).on('submit', '#modificarForm', function (e) {
        e.preventDefault();

        const idUsuario = $('#modificarForm').attr('action').split('/').pop();
        const nombres = $('input[name="nombresMod"]').val().trim();
        const apellidoP = $('input[name="apellidoPMod"]').val().trim();
        const apellidoM = $('input[name="apellidoMMod"]').val().trim();
        const correo = $('input[name="correoMod"]').val().trim();
        const fechaNacimiento = $('input[name="fechaNacimientoMod"]').val().trim();

        // Validaciones
        if (!/^[A-Za-z\s]+$/.test(nombres)) {
            Swal.fire('Error', 'El nombre solo puede contener letras y espacios.', 'error');
            return;
        }

        if (!/^[A-Za-z\s]+$/.test(apellidoP)) {
            Swal.fire('Error', 'El apellido paterno solo puede contener letras y espacios.', 'error');
            return;
        }

        if (apellidoM && !/^[A-Za-z\s]*$/.test(apellidoM)) {
            Swal.fire('Error', 'El apellido materno solo puede contener letras y espacios.', 'error');
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
            Swal.fire('Error', 'Por favor ingrese un correo electrónico válido.', 'error');
            return;
        }

        if (!fechaNacimiento) {
            Swal.fire('Error', 'La fecha de nacimiento es obligatoria.', 'error');
            return;
        }

        const datosUsuario = {
            nombres,
            apellidoP,
            apellidoM,
            correo,
            fechaNacimiento
        };

        // Realiza una solicitud AJAX para guardar los cambios
        $.ajax({
            url: `/usuarios/modificar/${idUsuario}`,
            method: 'POST',
            data: datosUsuario,
            success: function () {
                Swal.fire('Éxito', 'Usuario modificado correctamente.', 'success').then(() => {
                    location.reload();
                });
            },
            error: function () {
                Swal.fire('Error', 'Error al modificar el usuario.', 'error');
            }
        });
    });

    // ELIMINAR USUARIO //
    // Evento para eliminar usuario con SweetAlert
    $(document).on('click', '.btn-eliminar', function () {
        const idUsuario = $(this).data('id');

        // Mostrar el modal de confirmación con SweetAlert
        Swal.fire({
            title: '¿Estás seguro?',
            text: 'Esta acción no se puede deshacer',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
        }).then((resultado) => {
            if (resultado.isConfirmed) {
                // Realiza la solicitud AJAX para eliminar el usuario
                $.ajax({
                    url: `/usuarios/eliminar/${idUsuario}`,
                    method: 'POST',
                    success: function () {
                        Swal.fire('Eliminado', 'Usuario eliminado correctamente.', 'success').then(() => {
                            location.reload();
                        });
                    },
                    error: function () {
                        Swal.fire('Error', 'Error al eliminar el usuario.', 'error');
                    }
                });
            }
        });
    });
});