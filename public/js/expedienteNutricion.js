$(document).ready(function () {
    // Asegurarse de que estamos trabajando con el ID 1
    const urlParams = new URLSearchParams(window.location.search);
    if (!urlParams.has('id')) {
        // Si no hay ID en la URL, redireccionar a la misma página con ID=1
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
    }
    
    const idExpediente = urlParams.get('id');

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
    order: [], // No aplicar ordenamiento inicial - usar el orden del backend
    columnDefs: [
        {
            // Asegúrate de que la primera columna (tipo de documento) no se pueda ordenar
            targets: 0,
            orderable: false
        }
    ],
    createdRow: function(row, data, dataIndex) {
        // Destacar visualmente los documentos Nutricional V1
        if($(row).find('td:first').text().trim().includes('Historial Nutricional V1')) {
            $(row).addClass('highlight-nutricional-v1');
        }
    }
});

// Añadir CSS personalizado para destacar los V1
$('head').append(`
<style>
.highlight-nutricional-v1 {
    background-color: rgba(35, 160, 148, 0.1) !important;
    font-weight: bold;
}
</style>
`);

// Mover manualmente todos los Historiales V1 al inicio de la tabla al cargar
function moverHistorialV1AlInicio() {
    // Obtener todas las filas
    const rows = table.rows().nodes();
    
    // Recorrer las filas en orden inverso para no afectar los índices
    for (let i = rows.length - 1; i >= 0; i--) {
        const tipo = $(rows[i]).find('td:first').text().trim();
        
        // Si es un Historial Nutricional V1, moverlo al principio
        if (tipo.includes('Historial Nutricional V1')) {
            // Desacoplar la fila actual
            const row = table.row(i).node();
            $(row).detach();
            
            // Insertar al principio de la tabla
            $(table.table().body()).prepend(row);
        }
    }
}

// Llamar a la función después de que se inicialice la tabla
table.on('draw', function() {
    moverHistorialV1AlInicio();
});

// También ejecutar después de cualquier búsqueda o filtrado
table.on('search.dt', function() {
    setTimeout(moverHistorialV1AlInicio, 100);
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
        console.log('Ver historial nutricional V1:', documentoId);
        // Redirigir al historial nutricional
        const idExpediente = new URLSearchParams(window.location.search).get('id');
        window.location.href = `/nutricion/historial-nutricional?id=${documentoId}&expediente=${idExpediente}`;
    } else if (tipo === 'NUTRICIONAL_V2') {
        console.log('Ver historial nutricional V2:', documentoId);
        // Redirigir a la página de historial nutricional V2
        const idExpediente = new URLSearchParams(window.location.search).get('id');
        window.location.href = `/nutricion/historial-nutricional-v2?id=${documentoId}&expediente=${idExpediente}`;
    } else if (tipo === 'PDF') {
        // Código existente para PDF...
        console.log('Ver documento PDF:', documentoId);
        
        // Usar URL absoluta con el origen completo
        const url = `${window.location.origin}/nutricion/documentos/ver/${documentoId}`;
        console.log('URL del documento:', url);
        
        // Limpiar el iframe antes de cargar el nuevo contenido
        const iframe = $('#iframeVistaPreviaDocumento');
        iframe.attr('src', 'about:blank');
        
        // Mostrar el modal primero
        $('#modalVistaPreviaDocumento').css('display', 'flex');
        
        // Pequeño timeout para asegurar que el modal esté visible
        setTimeout(() => {
            iframe.attr('src', url);
        }, 100);
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
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo descargar el documento.'
            });
            console.error(xhr);
        }
    });
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