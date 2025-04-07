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
        pageLength: 10, // Número de registros por página
        lengthMenu: [5, 10, 25, 50], // Opciones de registros por página
        order: [[0, 'asc']] // Ordenar por la primera columna (Nombre del Usuario)
    });

    // Crear la barra superior personalizada
    const logo = $('<img src="/images/usuarios.png" alt="Logo Usuarios" class="dt-logo">');
    const registrarButton = $('<button class="button button-create" style="height: 30px;">Registrar Usuario</button>'); // Botón con altura ajustada
    const dtTopBar = $('<div class="dt-top-bar"></div>');

    // Agregar elementos a la barra superior
    dtTopBar.append(logo); // Agregar el logo
    $('.dataTables_length').appendTo(dtTopBar); // Mover el selector de registros por página
    $('.dataTables_filter').appendTo(dtTopBar); // Mover la barra de búsqueda al final de la barra superior
    $('.dataTables_wrapper').prepend(dtTopBar); // Insertar la barra superior antes de la tabla
    dtTopBar.append(registrarButton); // Mover el botón de registrar usuario a la barra superior


    // REGISTRAR USUARIO //
// Evento para abrir el modal de registrar usuario
$(document).on('click', '.button-create', function () {
    $('#modalRegistrar').css('display', 'flex'); // Muestra el modal
});

// Evento para cerrar el modal de registrar usuario
$(document).on('click', '.modal-background, .delete, .button.is-cancel', function () {
    $('#modalRegistrar').css('display', 'none'); // Oculta el modal
    $('#registrarForm')[0].reset(); // Resetea los campos del formulario
});

// Evento para enviar los datos del formulario y registrar un nuevo usuario
$(document).on('submit', '#registrarForm', function (e) {
    e.preventDefault();

    const nombreUsuario = $('input[name="nombreUsuarioReg"]').val().trim();
    const numTelefono = $('input[name="numTelefonoReg"]').val().trim();
    const fechaNacimiento = $('input[name="fechaNacimientoReg"]').val().trim();
    const contrasena = $('input[name="contrasenaReg"]').val().trim();

    // Validaciones
    if (!/^[A-Za-z\s]+$/.test(nombreUsuario)) {
        Swal.fire('Error', 'El nombre de usuario solo puede contener letras y espacios.', 'error');
        return;
    }

    if (!/^\d+$/.test(numTelefono)) {
        Swal.fire('Error', 'El número de teléfono solo puede contener números.', 'error');
        return;
    }

    if (!fechaNacimiento) {
        Swal.fire('Error', 'La fecha de nacimiento es obligatoria.', 'error');
        return;
    }

    if (contrasena.length < 6) {
        Swal.fire('Error', 'La contraseña debe tener al menos 6 caracteres.', 'error');
        return;
    }

    const datosUsuario = {
        nombreUsuario,
        numTelefono,
        fechaNacimiento,
        contrasena
    };

    // Realiza una solicitud AJAX para registrar el usuario
    $.ajax({
        url: '/usuarios/registrar', // Ruta para registrar el usuario
        method: 'POST',
        data: datosUsuario,
        success: function () {
            Swal.fire('Éxito', 'Usuario registrado correctamente.', 'success').then(() => {
                location.reload(); // Recarga la página para reflejar los cambios
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
        url: `/usuarios/modificar/${idUsuario}`, // Ruta para obtener los datos del usuario
        method: 'GET',
        success: function (usuario) {
            // Validar los datos recibidos antes de cargarlos en el modal
            if (!usuario.nombreUsuario || !/^[A-Za-z\s]+$/.test(usuario.nombreUsuario)) {
                Swal.fire('Error', 'El nombre de usuario recibido es inválido.', 'error');
                return;
            }

            if (!usuario.numTelefono || !/^\d+$/.test(usuario.numTelefono)) {
                Swal.fire('Error', 'El número de teléfono recibido es inválido.', 'error');
                return;
            }

            if (!usuario.fechaNacimiento) {
                Swal.fire('Error', 'La fecha de nacimiento recibida es inválida.', 'error');
                return;
            }

            if (!usuario.contrasena || usuario.contrasena.length < 6) {
                Swal.fire('Error', 'La contraseña recibida es inválida.', 'error');
                return;
            }

            // Carga los datos en el modal
            $('input[name="nombreUsuarioMod"]').val(usuario.nombreUsuario);
            $('input[name="numTelefonoMod"]').val(usuario.numTelefono);
            $('input[name="fechaNacimientoMod"]').val(usuario.fechaNacimiento.split('T')[0]);
            $('input[name="contrasenaMod"]').val(usuario.contrasena);

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
    $('#modalModificar').css('display', 'none'); // Oculta el modal
    $('#modificarForm')[0].reset(); // Resetea los campos del formulario
};

// Evento para enviar los datos del formulario y modificar el usuario
$(document).on('submit', '#modificarForm', function (e) {
    e.preventDefault();

    const idUsuario = $('#modificarForm').attr('action').split('/').pop(); // Obtiene el ID del usuario desde la acción del formulario
    const nombreUsuario = $('input[name="nombreUsuarioMod"]').val().trim();
    const numTelefono = $('input[name="numTelefonoMod"]').val().trim();
    const fechaNacimiento = $('input[name="fechaNacimientoMod"]').val().trim();
    const contrasena = $('input[name="contrasenaMod"]').val().trim();

    // Validaciones
    if (!/^[A-Za-z\s]+$/.test(nombreUsuario)) {
        Swal.fire('Error', 'El nombre de usuario solo puede contener letras y espacios.', 'error');
        return;
    }

    if (!/^\d+$/.test(numTelefono)) {
        Swal.fire('Error', 'El número de teléfono solo puede contener números.', 'error');
        return;
    }

    if (!fechaNacimiento) {
        Swal.fire('Error', 'La fecha de nacimiento es obligatoria.', 'error');
        return;
    }

    if (contrasena.length < 6) {
        Swal.fire('Error', 'La contraseña debe tener al menos 6 caracteres.', 'error');
        return;
    }

    const datosUsuario = {
        nombreUsuario,
        numTelefono,
        fechaNacimiento,
        contrasena
    };

    // Realiza una solicitud AJAX para guardar los cambios
    $.ajax({
        url: `/usuarios/modificar/${idUsuario}`,
        method: 'POST',
        data: datosUsuario,
        success: function () {
            Swal.fire('Éxito', 'Usuario modificado correctamente.', 'success').then(() => {
                location.reload(); // Recarga la página para reflejar los cambios
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
                    url: `/usuarios/eliminar/${idUsuario}`, // Ruta para eliminar el usuario
                    method: 'POST',
                    success: function () {
                        Swal.fire('Eliminado', 'Usuario eliminado correctamente.', 'success').then(() => {
                            location.reload(); // Recarga la página para reflejar los cambios
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