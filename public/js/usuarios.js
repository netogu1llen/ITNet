$(document).ready(function () {
    // Obtener el ID del usuario actual desde el atributo data
    const currentUserId = $('.section').data('current-user-id');
    
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
    const rolesButton = $('<button class="button button-roles button-create" style="height: 30px;">Roles</button>');
    const registrarButton = $('<button class="button button-registrar button-create" style="height: 30px; margin-left: 10px;">Registrar Usuario</button>');
    const dtTopBar = $('<div class="dt-top-bar"></div>');

    // Agregar elementos a la barra superior (ahora roles va primero)
    dtTopBar.append(logo);
    $('.dataTables_length').appendTo(dtTopBar);
    $('.dataTables_filter').appendTo(dtTopBar);
    $('.dataTables_wrapper').prepend(dtTopBar);
    dtTopBar.append(rolesButton);
    dtTopBar.append(registrarButton);

    // Evento para cambiar rol desde el dropdown en la tabla
    $(document).on('change', '.select-rol', function(e) {
        e.stopPropagation(); // Evitar que se propague al evento de la fila
        
        const idUsuario = $(this).data('id');
        const idRol = $(this).val();
        
        $.ajax({
            url: `/usuarios/cambiar-rol/${idUsuario}`,
            method: 'POST',
            data: { idRol },
            success: function() {
                Swal.fire({
                    title: 'Éxito!',
                    text: 'Rol actualizado correctamente.',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });
            },
            error: function(xhr, status, error) {
                console.error("Error al cambiar rol:", error);
                Swal.fire({
                    title: 'Error',
                    text: 'Error al cambiar el rol del usuario.',
                    icon: 'error'
                });
                // Revertir la selección en caso de error
                location.reload();
            }
        });
    });

    // Evento para redirigir a la página de roles - usando button-roles
    $(document).on('click', '.button-roles', function() {
        window.location.href = '/roles';
    });

     // Configurar fecha máxima para el input de fecha (18 años atrás)
     const hoy = new Date();
     const fechaMinima = new Date(hoy.getFullYear() - 100, hoy.getMonth(), hoy.getDate()).toISOString().split('T')[0];
     const fechaMaxima = new Date(hoy.getFullYear() - 18, hoy.getMonth(), hoy.getDate()).toISOString().split('T')[0];
     
     $('input[name="fechaNacimientoReg"], input[name="fechaNacimientoMod"]').attr('max', fechaMaxima);
     $('input[name="fechaNacimientoReg"], input[name="fechaNacimientoMod"]').attr('min', fechaMinima);
     
     // Función para verificar si un correo ya existe en la base de datos
     function verificarCorreoExistente(correo, idUsuario = null) {
         return new Promise((resolve, reject) => {
             $.ajax({
                 url: '/usuarios/verificar-correo',
                 method: 'POST',
                 data: { correo, idUsuario },
                 success: function(response) {
                     resolve(response.existe);
                 },
                 error: function(error) {
                     console.error("Error al verificar correo:", error);
                     reject(error);
                 }
             });
         });
     }


    // REGISTRAR USUARIO //
    // Evento para abrir el modal de registrar usuario - usando button-registrar
    $(document).on('click', '.button-registrar', function () {
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
        // Si se hizo clic en un botón, select o cualquier elemento dentro de ellos, no activar este evento
        if ($(e.target).is('button, select') || $(e.target).closest('button, select').length) {
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

                // Establecer el rol si existe
                if (usuario.idRol) {
                    $('select[name="idRolMod"]').val(usuario.idRol);
                } else {
                    $('select[name="idRolMod"]').val("0");
                }
                
                // Formatear la fecha correctamente para el input date
                if (usuario.fechaNacimiento) {
                    // Si la fecha está en formato YYYY-MM-DD ya es válida para el input
                    if (usuario.fechaNacimiento.includes('-')) {
                        $('input[name="fechaNacimientoMod"]').val(usuario.fechaNacimiento);
                    }
                    // Si la fecha está en formato DD/MM/YYYY, convertirla a YYYY-MM-DD
                    else if (usuario.fechaNacimiento.includes('/')) {
                        const partes = usuario.fechaNacimiento.split('/');
                        if (partes.length === 3) {
                            const fechaFormateada = `${partes[2]}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}`;
                            $('input[name="fechaNacimientoMod"]').val(fechaFormateada);
                        }
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

    // Modificar el evento de submit del formulario de modificación (similar al de registro)
    $(document).on('submit', '#modificarForm', function (e) {
        e.preventDefault();

        const idUsuario = $('#modificarForm').attr('action').split('/').pop();
        const nombres = $('input[name="nombresMod"]').val().trim();
        const apellidoP = $('input[name="apellidoPMod"]').val().trim();
        const apellidoM = $('input[name="apellidoMMod"]').val().trim();
        const correo = $('input[name="correoMod"]').val().trim();
        const fechaNacimiento = $('input[name="fechaNacimientoMod"]').val().trim();
        const idRol = $('select[name="idRolMod"]').val();

        // Validar campos obligatorios
        if (!nombres || !apellidoP || !apellidoM || !correo || !fechaNacimiento) {
            Swal.fire({
                title: 'Validación',
                text: 'Todos los campos son obligatorios.',
                icon: 'warning'
            });
            return;
        }

        // Validar longitud máxima
        if (nombres.length > 100 || apellidoP.length > 60 || 
            (apellidoM && apellidoM.length > 60) || correo.length > 50) {
            Swal.fire({
                title: 'Validación',
                text: 'Uno o más campos exceden la longitud permitida.',
                icon: 'warning'
            });
            return;
        }
        // Validaciones
        if (!/^[A-Za-záéíóúÁÉÍÓÚüÜñÑ\s]+$/.test(nombres)) {
            Swal.fire({
                title: 'Validación',
                text: 'El nombre solo puede contener letras, acentos y espacios.',
                icon: 'warning'
            });
            return;
        }

        if (!/^[A-Za-záéíóúÁÉÍÓÚüÜñÑ\s]+$/.test(apellidoP)) {
            Swal.fire({
                title: 'Validación',
                text: 'El apellido paterno solo puede contener letras, acentos y espacios.',
                icon: 'warning'
            });
            return;
        }

        if (apellidoM && !/^[A-Za-záéíóúÁÉÍÓÚüÜñÑ\s]*$/.test(apellidoM)) {
            Swal.fire({
                title: 'Validación',
                text: 'El apellido materno solo puede contener letras, acentos y espacios.',
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

        // Verificar correo único (excepto si es el mismo usuario)
        verificarCorreoExistente(correo, idUsuario)
            .then(existe => {
                if (existe) {
                    Swal.fire({
                        title: 'Validación',
                        text: 'Este correo electrónico ya está registrado para otro usuario.',
                        icon: 'warning'
                    });
                } else {
                    // Continuar con la modificación si el correo es único
                    const datosUsuario = {
                        nombres,
                        apellidoP,
                        apellidoM,
                        correo,
                        fechaNacimiento,
                        idRol
                    };

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
                                text: 'Error al modificar el usuario: ' + (xhr.responseJSON?.error || error),
                                icon: 'error'
                            });
                        }
                    });
                }
            })
            .catch(error => {
                Swal.fire({
                    title: 'Error',
                    text: 'Error al verificar el correo. Inténtelo de nuevo.',
                    icon: 'error'
                });
            });
    });
    


    // ELIMINAR USUARIO //
    // Evento para eliminar usuario con confirmación
    $(document).on('click', '.btn-eliminar', function (e) {
        e.stopPropagation(); // Evita que se propague al evento de la fila
        const idUsuario = $(this).data('id');

        // Evitar eliminación de sí mismo en cliente
        if (idUsuario == currentUserId) {
            Swal.fire('Error', 'No puedes eliminar tu propia cuenta.', 'error');
            return;
        }

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

    // Modificar el evento de submit del formulario de registro
    $(document).on('submit', '#registrarForm', function (e) {
        e.preventDefault();

        const nombres = $('input[name="nombresReg"]').val().trim();
        const apellidoP = $('input[name="apellidoPReg"]').val().trim();
        const apellidoM = $('input[name="apellidoMReg"]').val().trim();
        const correo = $('input[name="correoReg"]').val().trim();
        const fechaNacimiento = $('input[name="fechaNacimientoReg"]').val().trim();
        const idRol = $('select[name="idRolReg"]').val();

        // Validar campos obligatorios
        if (!nombres || !apellidoP || !apellidoM || !correo || !fechaNacimiento) {
            Swal.fire({
                title: 'Validación',
                text: 'Todos los campos son obligatorios.',
                icon: 'warning'
            });
            return;
        }

        // Validar longitud máxima
        if (nombres.length > 100 || apellidoP.length > 60 || 
            (apellidoM && apellidoM.length > 60) || correo.length > 50) {
            Swal.fire({
                title: 'Validación',
                text: 'Uno o más campos exceden la longitud permitida.',
                icon: 'warning'
            });
            return;
        }
        // Validaciones
        if (!/^[A-Za-záéíóúÁÉÍÓÚüÜñÑ\s]+$/.test(nombres)) {
            Swal.fire({
                title: 'Validación',
                text: 'El nombre solo puede contener letras, acentos y espacios.',
                icon: 'warning'
            });
            return;
        }

        if (!/^[A-Za-záéíóúÁÉÍÓÚüÜñÑ\s]+$/.test(apellidoP)) {
            Swal.fire({
                title: 'Validación',
                text: 'El apellido paterno solo puede contener letras, acentos y espacios.',
                icon: 'warning'
            });
            return;
        }

        if (apellidoM && !/^[A-Za-záéíóúÁÉÍÓÚüÜñÑ\s]*$/.test(apellidoM)) {
            Swal.fire({
                title: 'Validación',
                text: 'El apellido materno solo puede contener letras, acentos y espacios.',
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

        // Verificar correo único antes de enviar
        verificarCorreoExistente(correo)
            .then(existe => {
                if (existe) {
                    Swal.fire({
                        title: 'Validación',
                        text: 'Este correo electrónico ya está registrado. Por favor use otro.',
                        icon: 'warning'
                    });
                } else {
                    // Si el correo no existe, proceder con el registro
                    const datosUsuario = {
                        nombres,
                        apellidoP,
                        apellidoM,
                        correo,
                        fechaNacimiento,
                        idRol
                    };

                    // Enviar datos al servidor
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
                                text: 'Error al registrar el usuario: ' + (xhr.responseJSON?.error || error),
                                icon: 'error'
                            });
                        }
                    });
                }
            })
            .catch(error => {
                Swal.fire({
                    title: 'Error',
                    text: 'Error al verificar el correo. Inténtelo de nuevo.',
                    icon: 'error'
                });
            });
    });
});
