$(document).ready(function () {
    // Asegurarse de que estamos trabajando con el ID 1
    const urlParams = new URLSearchParams(window.location.search);
    if (!urlParams.has('id')) {
        // Si no hay ID en la URL, redireccionar a la misma página con ID=1
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
    }
    
    const idExpediente = urlParams.get('id') || '1';

    // Inicializar DataTable para la tabla de documentos
    const table = $('#documentosTable').DataTable({
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
    const logo = $('<img src="/images/icono_salud.png" alt="Logo Nutrición" class="dt-logo">');
    const nuevaSesionButton = $('<button class="button button-create" style="height: 30px;">Nueva Sesión</button>');
    const generarHistoriaButton = $('<button class="button button-create" style="height: 30px;">Generar Historia Clínica</button>');
    const dtTopBar = $('<div class="dt-top-bar"></div>');

    // Agregar elementos a la barra
    dtTopBar.append(logo);
    $('.dataTables_length').appendTo(dtTopBar);
    $('.dataTables_filter').appendTo(dtTopBar);
    dtTopBar.append(nuevaSesionButton);
    dtTopBar.append(generarHistoriaButton);
    $('#TopBar').append(dtTopBar);

    // Funciones para mostrar y ocultar el modal de carga
    function showLoadingModal(title, message) {
        $('#loadingModalTitle').text(title || 'Procesando...');
        $('#loadingModalMessage').text(message || 'Por favor espere mientras se procesa su solicitud.');
        $('#loadingModal').addClass('is-active');
        $('#loadingModal').css('display', 'flex');
    }

    function hideLoadingModal() {
        setTimeout(() => {
            $('#loadingModal').removeClass('is-active');
            $('#loadingModal').css('display', 'none');
        }, 500);
    }

    // Evento para el botón Nueva Sesión
    nuevaSesionButton.on('click', function() {
        // Aquí puedes agregar la lógica para crear una nueva sesión
        console.log('Nueva sesión para ID', idExpediente);
    });

    // Evento para el botón Generar Historia Clínica
    generarHistoriaButton.on('click', function() {
        // Aquí puedes agregar la lógica para generar la historia clínica
        console.log('Generar historia clínica para ID', idExpediente);
    });
    
    // VISTA PREVIA DEL DOCUMENTO AL CLIC EN UNA FILA
    $(document).on('click', '.fila-documento', function(e) {
        // No hacer nada si el clic fue en un botón
        if ($(e.target).closest('button, .btn-descargar').length) {
            return;
        }
        
        const documentoId = $(this).data('id');
        const tipo = $(this).data('tipo');
        
        if (tipo === 'NUTRICIONAL_V1') {
            console.log('Ver historial nutricional:', documentoId);
            // En el futuro, implementar la navegación al historial
            alert(`Visualizando historial nutricional.\nID: ${documentoId}`);
            // window.location.href = `/nutricion/historial-nutricional?id=${documentoId}&expediente=${idExpediente}`;
        } else if (tipo === 'PDF') {
            console.log('Ver documento PDF:', documentoId);
            // En el futuro, implementar la visualización de PDF
            alert('La visualización de documentos PDF está en desarrollo');
            // const url = `/nutricion/documentos/ver/${documentoId}`;
            // window.open(url, '_blank');
        }
    });

    // Manejador de eventos para botones de descarga
    $(document).on('click', '.btn-descargar', function(event) {
        event.preventDefault();
        event.stopPropagation(); // Evitar que se active la vista previa
        
        const documentoId = $(this).data('id');
        const tipo = $(this).data('tipo');
        
        console.log('Descargando documento:', documentoId, 'de tipo:', tipo);
        
        // Mostrar modal de carga
        showLoadingModal('Preparando descarga', 'Por favor espere mientras se prepara el documento...');
        
        // Por ahora, solo simular la descarga
        setTimeout(() => {
            hideLoadingModal();
            alert('La funcionalidad de descarga está en desarrollo');
        }, 1000);
        
        // Cuando implementen la descarga real, usa este código:
        /*
        // Usar AJAX para la descarga
        $.ajax({
            url: `/nutricion/documentos/descargar/${documentoId}`,
            method: 'GET',
            xhrFields: {
                responseType: 'blob' // Importante para manejar PDFs
            },
            success: function(data) {
                hideLoadingModal();
                
                // Crear objeto URL para la descarga
                const blob = new Blob([data], { type: 'application/pdf' });
                const url = window.URL.createObjectURL(blob);
                
                // Crear elemento para la descarga
                const link = document.createElement('a');
                link.href = url;
                link.download = (tipo === 'NUTRICIONAL_V1') ? 'historial_nutricional.pdf' : `documento_${documentoId}.pdf`;
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
                alert('No se pudo descargar el documento.');
                console.error(xhr);
            }
        });
        */
    });

    // Botón Eliminar Documento
    $(document).on('click', '.btn-eliminar', function(event) {
        event.preventDefault();
        event.stopPropagation(); // Evitar que se active la vista previa
        
        const id = $(this).data('id');
        const tipo = $(this).data('tipo');
        
        // Mostrar confirmación
        if (confirm('¿Está seguro de que desea eliminar este documento? Esta acción no se puede deshacer.')) {
            console.log('Eliminando documento:', id, 'de tipo:', tipo);
            
            // Por ahora, solo simular la eliminación
            setTimeout(() => {
                alert('La funcionalidad de eliminación está en desarrollo');
            }, 500);
            
            // Cuando implementen la eliminación real, usa este código:
            /*
            $.ajax({
                url: `/nutricion/documentos/eliminar/${id}?tipo=${tipo}`,
                type: 'DELETE',
                success: function() {
                    alert('Documento eliminado correctamente');
                    // Eliminar la fila de la tabla
                    table.row($(this).closest('tr')).remove().draw();
                },
                error: function(err) {
                    alert('Error al eliminar el documento.');
                    console.error(err);
                }
            });
            */
        }
    });

    // CERRAR MODAL DE VISTA PREVIA
    $(document).on('click', '#modalVistaPreviaDocumento .modal-background, #modalVistaPreviaDocumento .delete', function () {
        $('#modalVistaPreviaDocumento').css('display', 'none');
        $('#iframeVistaPreviaDocumento').attr('src', '');  // Limpiar el iframe cuando se cierra
    });
});