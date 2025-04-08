$(document).ready(function () {
    const table = $('#expedientePsicologicoTable').DataTable({
        language: {
            info: "Mostrando _START_ a _END_ de _TOTAL_ documentos",
            infoEmpty: "No hay documentos disponibles",
            infoFiltered: "(filtrado de _MAX_ documentos en total)",
            paginate: {
                previous: "Anterior",
                next: "Siguiente"
            },
            lengthMenu: "Mostrar _MENU_ documentos por página",
            search: "Buscar documento:"
        },
        pageLength: 10,
        lengthMenu: [5, 10, 25, 50],
        order: [[1, 'desc']] // Ordenar por la columna de Fecha de Creación (descendente)
    });

    // Crear barra superior personalizada
    const logo = $('<img src="/images/psychology.png" alt="Logo Psicologia" class="dt-logo">');
    const subirDocumentoButton = $('<button class="button button-create button-upload" style="height: 30px;">Subir Documento</button>');
    const registrarSeguimientoButton = $('<button class="button button-create" style="height: 30px;">Registrar Seguimiento</button>');
    const dtTopBar = $('<div class="dt-top-bar"></div>');

    // Agregar elementos a la barra
    dtTopBar.append(logo);
    $('.dataTables_length').appendTo(dtTopBar);
    $('.dataTables_filter').appendTo(dtTopBar);
    dtTopBar.append(subirDocumentoButton);
    dtTopBar.append(registrarSeguimientoButton);
    $('#TopBar').append(dtTopBar);

    // ABRIR MODAL
    $(document).on('click', '.button-upload', function () {
        $('#modalSubirDocumento').css('display', 'flex');
    });

    // CERRAR MODAL
    $(document).on('click', '.modal-background, .delete, .button.is-cancel', function () {
        $('#modalSubirDocumento').css('display', 'none');
        $('#subirDocumentoForm')[0].reset();
        $('#nombreArchivo').text('No hay archivo seleccionado');
    });

    // MOSTRAR NOMBRE DEL ARCHIVO
    $('input[name="archivoDocumento"]').on('change', function () {
        const archivo = $(this)[0].files[0];
        $('#nombreArchivo').text(archivo ? archivo.name : 'No hay archivo seleccionado');
    });

   // ENVÍO DEL FORMULARIO
$('#subirDocumentoForm').on('submit', function (e) {
    e.preventDefault();

    const nombreDocumento = $('input[name="nombreDocumento"]').val().trim();
    const archivo = $('input[name="archivoDocumento"]')[0].files[0];

    if (!archivo || archivo.type !== "application/pdf") {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Debe seleccionar un archivo PDF válido.'
        });
        return;
    }

    // Obtener el ID del expediente de la URL actual
    const urlPath = window.location.pathname;
    const expedienteId = urlPath.split('/').pop();

    const formData = new FormData();
    formData.append('nombreDocumento', nombreDocumento);
    formData.append('archivoDocumento', archivo);

    $.ajax({
        url: `/psicologia/documentos/subir/${expedienteId}`,
        method: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function (response) {
            Swal.fire({
                icon: 'success',
                title: '¡Éxito!',
                text: 'Documento subido correctamente.'
            }).then(() => {
                $('#modalSubirDocumento').css('display', 'none');
                location.reload();
            });
        },
        error: function (xhr) {
            console.error('Error al subir documento:', xhr);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al subir el documento. Por favor, intenta de nuevo.'
            });
        }
    });
});


    // Acción del botón Registrar Seguimiento
    registrarSeguimientoButton.on('click', function () {
        $('#modalRegistrarSeguimiento').css('display', 'flex'); // Abre el modal para registrar un seguimiento
    });

        // Botón Eliminar Documento
    $('#expedientePsicologicoTable').on('click', '.btn-eliminar', function () {
        const id = $(this).data('id');
        
        // Mostrar un SweetAlert2 de confirmación
        Swal.fire({
            title: '¿Estás seguro?',
            text: "Esta acción no se puede deshacer.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    url: `/psicologia/documentos/eliminar/${id}`,
                    type: 'DELETE',
                    success: function () {
                        // SweetAlert2 para indicar éxito
                        Swal.fire({
                            icon: 'success',
                            title: '¡Eliminado!',
                            text: 'El documento ha sido eliminado.',
                        }).then(() => {
                            location.reload();
                        });
                    },
                    error: function (err) {
                        // SweetAlert2 para error
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: 'No se pudo eliminar el documento.',
                        });
                        console.error(err);
                    }
                });
            }
        });
    });



    // VISTA PREVIA DEL DOCUMENTO AL CLIC EN UNA FILA
    $(document).on('click', '.fila-documento', function (event) {
        const documentoId = $(this).data('id');  // Obtener el ID del documento
        if (documentoId) {
            // Cambiar la URL para solo mostrar el documento
            const url = `/psicologia/documentos/ver/${documentoId}`; 
            
            $('#iframeVistaPreviaDocumento').attr('src', url);  // Establecer la URL en el iframe
            $('#modalVistaPreviaDocumento').css('display', 'flex');  // Mostrar el modal con la vista previa
        } else {
            console.error('ID del documento no encontrado.');
        }
    });

    // Asegurarse de que el evento de clic en los botones no active la vista previa
    $('#expedientePsicologicoTable').on('click', 'td a, td .btn-eliminar', function (event) {
        event.stopPropagation();  // Detener la propagación del clic hacia la fila
    });


    // CERRAR MODAL DE VISTA PREVIA
    $(document).on('click', '#modalVistaPreviaDocumento .modal-background, #modalVistaPreviaDocumento .delete', function () {
        $('#modalVistaPreviaDocumento').css('display', 'none');
        $('#iframeVistaPreviaDocumento').attr('src', '');  // Limpiar el iframe cuando se cierra
    });


});