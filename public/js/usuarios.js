$(document).ready(function () {
    // Evento para abrir el modal y cargar los datos del usuario
    $(document).on('click', '.btn-modificar', function () {
        const idUsuario = $(this).data('id');

        // Realiza una solicitud AJAX para obtener los datos del usuario
        $.ajax({
            url: `/usuarios/modificar/${idUsuario}`, // Ruta para obtener los datos del usuario
            method: 'GET',
            success: function (usuario) {
                // Carga los datos en el modal
                $('input[name="nombreUsuario"]').val(usuario.nombreUsuario);
                $('input[name="numTelefono"]').val(usuario.numTelefono);
                $('input[name="fechaNacimiento"]').val(usuario.fechaNacimiento.split('T')[0]);
                $('input[name="contrasena"]').val(usuario.contrasena);

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
        console.log('cerrarModalModificar ejecutado'); // Depuración
        $('#modalModificar').css('display', 'none'); // Oculta el modal
        $('#modificarForm')[0].reset(); // Resetea los campos del formulario
    };

    // Evento para enviar los datos del formulario y modificar el usuario
    $(document).on('submit', '#modificarForm', function (e) {
        e.preventDefault();

        const idUsuario = $('#modificarForm').attr('action').split('/').pop(); // Obtiene el ID del usuario desde la acción del formulario
        const datosUsuario = {
            nombreUsuario: $('input[name="nombreUsuario"]').val(),
            numTelefono: $('input[name="numTelefono"]').val(),
            fechaNacimiento: $('input[name="fechaNacimiento"]').val(),
            contrasena: $('input[name="contrasena"]').val()
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