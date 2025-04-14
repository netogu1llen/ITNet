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
        $('#modalRegistrar, #modalModificar').css('display', 'none');
        $('#registrarForm')[0].reset();
        $('#modificarForm')[0].reset();
    });

    // MODIFICAR USUARIO //
    // Evento para hacer clickeable toda la fila (excepto botones)
    $(document).on('click', '.usuario-fila', function(e) {
        // Si se hizo clic en un botón dentro de la fila, no activar este evento
        if ($(e.target).is('button') || $(e.target).closest('button').length) {
            return;
        }
        
        const idUsuario = $(this).data('id');
        cargarDatosUsuario(idUsuario);
    });

    // Función para cargar los datos del usuario en el modal
    function cargarDatosUsuario(idUsuario) {
        // Realiza una solicitud AJAX para obtener los datos del usuario
        $.ajax({
            url: `/usuarios/modificar/${idUsuario}`,
            method: 'GET',
            success: function (usuario) {
                // Validar que recibimos datos del usuario
                if (!usuario || typeof usuario !== 'object') {
                    Swal.fire({
                        title: 'Error',
                        text: 'No se pudieron obtener los datos del usuario.',
                        icon: 'error'
                    });
                    return;
                }

                // Carga los datos en el modal
                $('input[name="nombresMod"]').val(usuario.nombres || '');
                $('input[name="apellidoPMod"]').val(usuario.apellidoP || '');
                $('input[name="apellidoMMod"]').val(usuario.apellidoM || '');
                $('input[name="correoMod"]').val(usuario.correo || '');
                
                // Formatear la fecha correctamente
                if (usuario.fechaNacimiento) {
                    let fecha = new Date(usuario.fechaNacimiento);
                    if (!isNaN(fecha.getTime())) {
                        // Formato YYYY-MM-DD para el input date
                        const fechaFormateada = fecha.toISOString().split('T')[0];
                        $('input[name="fechaNacimientoMod"]').val(fechaFormateada);
                    }
                }

                // Muestra el modal
                $('#modalModificar').css('display', 'flex');
                $('#modificarForm').attr('action', `/usuarios/modificar/${idUsuario}`);
            },
            error: function (xhr, status, error) {
                console.error("Error al obtener datos:", error);
                Swal.fire({
                    title: 'Error',
                    text: 'Error al cargar los datos del usuario.',
                    icon: 'error'
                });
            }
        });
    }

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
            Swal.fire({
                title: 'Validación',
                text: 'El nombre solo puede contener letras y espacios.',
                icon: 'warning'
            });
            return;
        }

        if (!/^[A-Za-z\s]+$/.test(apellidoP)) {
            Swal.fire({
                title: 'Validación',
                text: 'El apellido paterno solo puede contener letras y espacios.',
                icon: 'warning'
            });
            return;
        }

        if (apellidoM && !/^[A-Za-z\s]*$/.test(apellidoM)) {
            Swal.fire({
                title: 'Validación',
                text: 'El apellido materno solo puede contener letras y espacios.',
                icon: 'warning'
            });
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
            Swal.fire({
                title: 'Validación',
                text: 'Por favor ingrese un correo electrónico válido.',
                icon: 'warning'
            });
            return;
        }

        if (!fechaNacimiento) {
            Swal.fire({
                title: 'Validación',
                text: 'La fecha de nacimiento es obligatoria.',
                icon: 'warning'
            });
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
                Swal.fire({
                    title: 'Éxito!',
                    text: 'Usuario modificado correctamente.',
                    icon: 'success'
                }).then(() => {
                    location.reload();
                });
            },
            error: function (xhr, status, error) {
                console.error("Error al modificar:", error);
                Swal.fire({
                    title: 'Error',
                    text: 'Error al modificar el usuario.',
                    icon: 'error'
                });
            }
        });
    });

    // ELIMINAR USUARIO //
    // Evento para eliminar usuario con confirmación
    $(document).on('click', '.btn-eliminar', function (e) {
        e.stopPropagation(); // Evita que se propague al evento de la fila
        const idUsuario = $(this).data('id');

        // Usar SweetAlert para la confirmación
        Swal.fire({
            title: "¿Eliminar este usuario?",
            text: "Esta acción no se puede deshacer",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar"
        }).then((result) => {
            if (result.isConfirmed) {
                // Realiza la solicitud AJAX para eliminar el usuario
                $.ajax({
                    url: `/usuarios/eliminar/${idUsuario}`,
                    method: 'POST',
                    success: function () {
                        Swal.fire({
                            title: 'Eliminado!',
                            text: 'Usuario eliminado correctamente.',
                            icon: 'success'
                        }).then(() => {
                            location.reload();
                        });
                    },
                    error: function (xhr, status, error) {
                        console.error("Error al eliminar:", error);
                        Swal.fire({
                            title: 'Error',
                            text: 'Error al eliminar el usuario.',
                            icon: 'error'
                        });
                    }
                });
            }
        });
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
            Swal.fire({
                title: 'Validación',
                text: 'El nombre solo puede contener letras y espacios.',
                icon: 'warning'
            });
            return;
        }

        if (!/^[A-Za-z\s]+$/.test(apellidoP)) {
            Swal.fire({
                title: 'Validación',
                text: 'El apellido paterno solo puede contener letras y espacios.',
                icon: 'warning'
            });
            return;
        }

        if (apellidoM && !/^[A-Za-z\s]*$/.test(apellidoM)) {
            Swal.fire({
                title: 'Validación',
                text: 'El apellido materno solo puede contener letras y espacios.',
                icon: 'warning'
            });
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
            Swal.fire({
                title: 'Validación',
                text: 'Por favor ingrese un correo electrónico válido.',
                icon: 'warning'
            });
            return;
        }

        if (!fechaNacimiento) {
            Swal.fire({
                title: 'Validación',
                text: 'La fecha de nacimiento es obligatoria.',
                icon: 'warning'
            });
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
                Swal.fire({
                    title: 'Éxito!',
                    text: 'Usuario registrado correctamente.',
                    icon: 'success'
                }).then(() => {
                    location.reload();
                });
            },
            error: function (xhr, status, error) {
                console.error("Error al registrar:", error);
                Swal.fire({
                    title: 'Error',
                    text: 'Error al registrar el usuario.',
                    icon: 'error'
                });
            }
        });
    });
});