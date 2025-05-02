$(document).ready(function () {
    const table = $('#expedienteTable').DataTable({
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
    const logo = $('<img src="/images/pacientes.png" alt="Logo Pacientes" class="dt-logo">');
    const subirDocumentoButton = $('<button class="button button-create button-upload" style="height: 30px;">Subir Documento</button>');
    const editarPacienteButton = $('<button class="button button-create" style="height: 30px;">Editar Paciente</button>');
    const dtTopBar = $('<div class="dt-top-bar"></div>');

    // Agregar elementos a la barra
    dtTopBar.append(logo);
    $('.dataTables_length').appendTo(dtTopBar);
    $('.dataTables_filter').appendTo(dtTopBar);
    dtTopBar.append(subirDocumentoButton);
    dtTopBar.append(editarPacienteButton);
    $('#TopBar').append(dtTopBar);

    // Manejar clic en el botón de editar paciente
    editarPacienteButton.on('click', function() {
        // Obtener el ID del expediente de la URL
        const urlPath = window.location.pathname;
        const idExpediente = urlPath.split('/').pop();
        
        // Redirigir a la página de edición
        window.location.href = `/pacientes/editar/${idExpediente}`;
    });

    // Crear modal de carga y añadirlo al DOM
    const loadingModal = `
        <div id="loadingModal" class="modal">
            <div class="modal-background"></div>
            <div class="modal-content">
                <div class="box has-text-centered">
                    <p class="title is-4 mb-3" id="loadingModalTitle">Procesando...</p>
                    <progress class="progress is-primary" max="100"></progress>
                    <p id="loadingModalMessage" class="mt-3">Por favor espere mientras se procesa su solicitud.</p>
                </div>
            </div>
        </div>
    `;
    $('body').append(loadingModal);

    // Funciones para mostrar y ocultar el modal de carga
    function showLoadingModal(title, message) {
        $('#loadingModalTitle').text(title || 'Procesando...');
        $('#loadingModalMessage').text(message || 'Por favor espere mientras se procesa su solicitud.');
        $('#loadingModal').addClass('is-active');
        $('#loadingModal').css('display', 'flex');
        console.log('Modal mostrado:', title);
    }

    function hideLoadingModal() {
        setTimeout(() => {
            $('#loadingModal').removeClass('is-active');
            $('#loadingModal').css('display', 'none');
            console.log('Modal ocultado');
        }, 500);
    }

    // ABRIR MODAL
    subirDocumentoButton.on('click', function () {
        console.log("Abriendo modal de subir documentos");
        $('#modalSubirDocumentos').addClass('is-active');
        $('#modalSubirDocumentos').css('display', 'flex');
        // Limpiar el formulario al abrir
        limpiarFormularioDocumentos();
    });

    // CERRAR MODAL
    $(document).on('click', '.modal-background, .delete, .button.is-cancel', function () {
        console.log("Cerrando modal");
        $('#modalSubirDocumentos').removeClass('is-active');
        $('#modalSubirDocumentos').css('display', 'none');
        limpiarFormularioDocumentos();
    });

    // Función para limpiar formulario
    function limpiarFormularioDocumentos() {
        $('#subirMultiplesDocumentosForm')[0].reset();
        $('#nombreArchivo').text('No hay archivos seleccionados');
        $('#listaArchivosSeleccionados').empty();
    }

    // MOSTRAR NOMBRES DE LOS ARCHIVOS SELECCIONADOS
    $('input[name="archivosDocumento"]').on('change', function () {
        const archivos = $(this)[0].files;
        const listaArchivos = $('#listaArchivosSeleccionados');
        
        if (archivos.length === 0) {
            $('#nombreArchivo').text('No hay archivos seleccionados');
            listaArchivos.empty();
            return;
        }
        
        $('#nombreArchivo').text(`${archivos.length} archivo(s) seleccionado(s)`);
        
        // Mostrar lista de archivos
        listaArchivos.empty();
        if (archivos.length > 0) {
            const ul = $('<ul></ul>');
            for (let i = 0; i < archivos.length; i++) {
                const li = $('<li></li>').text(archivos[i].name);
                ul.append(li);
            }
            listaArchivos.append(ul);
        }
    });

    // ENVÍO DEL FORMULARIO DE MÚLTIPLES DOCUMENTOS
    $('#subirMultiplesDocumentosForm').on('submit', function (e) {
        e.preventDefault();
        
        const archivos = $('input[name="archivosDocumento"]')[0].files;
        
        if (archivos.length === 0) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Debe seleccionar al menos un archivo PDF.'
            });
            return;
        }
        
        // Verificar que todos son PDFs
        for (let i = 0; i < archivos.length; i++) {
            if (archivos[i].type !== "application/pdf") {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: `El archivo "${archivos[i].name}" no es un PDF válido.`
                });
                return;
            }
        }
        
        // Mostrar modal de carga
        showLoadingModal('Subiendo archivos', `Subiendo ${archivos.length} documento(s)...`);
        
        // Obtener el ID del expediente de la URL actual
        const urlPath = window.location.pathname;
        const expedienteId = urlPath.split('/').pop();
        
        const formData = new FormData();
        
        // Agregar todos los archivos al FormData
        for (let i = 0; i < archivos.length; i++) {
            formData.append('archivosDocumento', archivos[i]);
        }
        
        $.ajax({
            url: `/pacientes/documentos/subir-multiple/${expedienteId}`,
            method: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function (response) {
                // Ocultar modal de carga
                hideLoadingModal();
                
                Swal.fire({
                    icon: 'success',
                    title: '¡Éxito!',
                    text: `${archivos.length} documento(s) subido(s) correctamente.`
                }).then(() => {
                    $('#modalSubirDocumentos').removeClass('is-active');
                    $('#modalSubirDocumentos').css('display', 'none');
                    location.reload();
                });
            },
            error: function (xhr) {
                // Ocultar modal de carga incluso en caso de error
                hideLoadingModal();
                
                console.error('Error al subir documentos:', xhr);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error al subir los documentos. Por favor, intente de nuevo.'
                });
            }
        });
    });

    // Botón Eliminar Documento
    $('#expedienteTable').on('click', '.btn-eliminar', function () {
        const id = $(this).data('id');
        const tipo = $(this).data('tipo');
        
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
                    url: `/pacientes/documentos/eliminar/${id}?tipo=${tipo}`,
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
    $(document).on('click', '.fila-documento', function () {
        const documentoId = $(this).data('id');
        
        // Mostrar el documento PDF sin modal de carga
        const url = `/pacientes/documentos/ver/${documentoId}`;
        const iframe = $('#iframeVistaPreviaDocumento');
        
        iframe.attr('src', url);
        $('#modalVistaPreviaDocumento').css('display', 'flex');
    });    

    // Asegurarse de que el evento de clic en los botones no active la vista previa
    $('#expedienteTable').on('click', 'td a, td .btn-eliminar', function (event) {
        event.stopPropagation();  // Detener la propagación del clic hacia la fila
    });

    // Función para descargar documentos
    window.descargarDocumento = function(documentoId, tipo) {
        // Prevenir comportamiento por defecto para evitar la navegación a #
        event.preventDefault();
        event.stopPropagation(); // Detener propagación del evento
        
        console.log('Descargando documento:', documentoId, 'de tipo:', tipo);
        
        // Mostrar modal de carga
        showLoadingModal('Preparando descarga', 'Por favor espere mientras se prepara el documento...');
        
        // Usar AJAX para descargar el documento
        $.ajax({
            url: `/pacientes/documentos/descargar/${documentoId}`,
            method: 'GET',
            xhrFields: {
                responseType: 'blob' // Crucial para manejar archivos binarios (PDF)
            },
            success: function(data, status, xhr) {
                hideLoadingModal();
                
                // Crear un objeto URL para la descarga
                const blob = new Blob([data], { type: 'application/pdf' });
                const url = window.URL.createObjectURL(blob);
                
                // Usar el tipo como nombre del archivo
                let filename = `${tipo || 'documento'}.pdf`;
                
                // Intentar extraer el nombre del header Content-Disposition
                const disposition = xhr.getResponseHeader('Content-Disposition');
                if (disposition && disposition.indexOf('attachment') !== -1) {
                    const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                    const matches = filenameRegex.exec(disposition);
                    if (matches != null && matches[1]) { 
                        filename = matches[1].replace(/['"]/g, '');
                    }
                }
                
                // Crear un elemento <a> temporal para la descarga
                const link = document.createElement('a');
                link.href = url;
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                
                // Limpiar después de la descarga
                setTimeout(() => {
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(link);
                }, 100);
            },
            error: function(xhr) {
                hideLoadingModal();
                console.error('Error al descargar:', xhr);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo descargar el documento. Por favor intente nuevamente.'
                });
            }
        });
    };

    // Manejador de eventos para botones de descarga
    $(document).on('click', '.btn-descargar', function(event) {
        event.preventDefault();
        event.stopPropagation(); // Evitar que se active la vista previa
        
        const documentoId = $(this).data('id');
        const tipo = $(this).data('tipo');
        
        console.log('Descargando documento:', documentoId, 'de tipo:', tipo);
        
        // Mostrar modal de carga
        showLoadingModal('Preparando descarga', 'Por favor espere mientras se prepara el documento...');
        
        // Usar AJAX para la descarga
        $.ajax({
            url: `/pacientes/documentos/descargar/${documentoId}`,
            method: 'GET',
            xhrFields: {
                responseType: 'blob' // Importante para manejar PDFs
            },
            success: function(data, status, xhr) {
                hideLoadingModal();
                
                // Crear objeto URL para la descarga
                const blob = new Blob([data], { type: 'application/pdf' });
                const url = window.URL.createObjectURL(blob);
                
                // Obtener nombre de archivo del Content-Disposition si existe
                let filename = `${tipo || 'documento'}.pdf`; // Usar el tipo como nombre por defecto
                
                // Intentar extraer el nombre del header Content-Disposition
                const disposition = xhr.getResponseHeader('Content-Disposition');
                if (disposition && disposition.indexOf('attachment') !== -1) {
                    const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                    const matches = filenameRegex.exec(disposition);
                    if (matches != null && matches[1]) { 
                        // Eliminar comillas si existen
                        filename = matches[1].replace(/['"]/g, '');
                    }
                }
                
                // Crear elemento para la descarga
                const link = document.createElement('a');
                link.href = url;
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                
                // Limpiar
                setTimeout(() => {
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(link);
                }, 100);
            },
            error: function(xhr) {
                hideLoadingModal();
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo descargar el documento.'
                });
                console.error(xhr);
            }
        });
    });

    // CERRAR MODAL DE VISTA PREVIA
    $(document).on('click', '#modalVistaPreviaDocumento .modal-background, #modalVistaPreviaDocumento .delete', function () {
        $('#modalVistaPreviaDocumento').css('display', 'none');
        $('#iframeVistaPreviaDocumento').attr('src', '');  // Limpiar el iframe cuando se cierra
    });
});
