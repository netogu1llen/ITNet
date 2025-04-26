$(document).ready(function () {
    // Asegurarse de que estamos trabajando con el ID 1
    const urlParams = new URLSearchParams(window.location.search);
    let idExpediente = urlParams.get('id');

    // Si no existe en los parámetros, intentar obtenerlo de la ruta
    if (!idExpediente || idExpediente === 'null') {
        const urlPath = window.location.pathname;
        const segments = urlPath.split('/');
        idExpediente = segments[segments.length - 1];

        // Si aún no es válido, verificar si está en el penúltimo segmento
        if (isNaN(parseInt(idExpediente)) && segments.length > 2) {
            idExpediente = segments[segments.length - 2];
        }
    }

    // Validar si el ID es válido
    if (!idExpediente || idExpediente === 'null' || isNaN(parseInt(idExpediente))) {
        console.error('No se pudo determinar el ID del expediente.');
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo determinar el ID del expediente. Intente nuevamente o contacte a soporte.'
        });
    }

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
    const nuevaSesionButton = $('<button class="button button-create button-upload" style="height: 30px;">Subir Archivo</button>');
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
        console.log("Abriendo modal de subir documento");
        $('#modalSubirDocumento').addClass('is-active');
        $('#modalSubirDocumento').css('display', 'flex'); // Asegurar que se muestre
    });

    // Evento para el botón Generar Historia Clínica
    generarHistoriaButton.on('click', function() {
        if (idExpediente) {
            window.location.href = `/nutricion/historiaClinica/${idExpediente}`;
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo determinar el ID del expediente.'
            });
        }
    });
    
// CERRAR MODAL
$(document).on('click', '.modal-background, .delete, .button.is-cancel', function () {
    console.log("Cerrando modal");
    $('#modalSubirDocumento').removeClass('is-active');
    $('#modalSubirDocumento').css('display', 'none'); // Asegurar que se oculte
    $('#subirDocumentoForm')[0].reset();
    $('#nombreArchivo').text('No hay archivo seleccionado');
});

// MOSTRAR NOMBRE DEL ARCHIVO
$('input[name="archivoDocumento"]').on('change', function () {
    const archivo = $(this)[0].files[0];
    $('#nombreArchivo').text(archivo ? archivo.name : 'No hay archivo seleccionado');
});

// Función de envío del formulario
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

    // Obtener el ID del expediente
    // Intentar obtener primero de la URL como parámetro de consulta (como está ahora)
    let idExpediente = urlParams.get('id');
    
    // Si no existe en los parámetros, intentar obtenerlo de la ruta (como en psicología)
    if (!idExpediente || idExpediente === 'null') {
        const urlPath = window.location.pathname;
        const segments = urlPath.split('/');
        idExpediente = segments[segments.length - 1];
        
        // Si aún no es válido, verificar si está en el penúltimo segmento
        if (isNaN(parseInt(idExpediente)) && segments.length > 2) {
            idExpediente = segments[segments.length - 2];
        }
    }
    
    // Si aún no tenemos un ID válido, extraer del DOM (como último recurso)
    if (!idExpediente || idExpediente === 'null' || isNaN(parseInt(idExpediente))) {
        // Intentar extraer del título o de algún elemento que contenga el ID
        const tituloPaciente = $('.basic-black').first().text();
        // Si hay un ID en algún lugar visible en la página, podrías intentar extraerlo
        
        // Mostrar error si no se puede determinar el ID
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo determinar el ID del expediente. Intente nuevamente o contacte a soporte.'
        });
        return;
    }
    
    console.log('ID de expediente para subir:', idExpediente);
    
    // Ahora que tenemos un ID, continuar con la subida
    showLoadingModal('Subiendo archivo', 'Por favor espere mientras se sube el documento...');

    const formData = new FormData();
    formData.append('nombreDocumento', nombreDocumento);
    formData.append('archivoDocumento', archivo);

    $.ajax({
        url: `/nutricion/documentos/subir/${idExpediente}`,
        method: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function (response) {
            hideLoadingModal();
            
            Swal.fire({
                icon: 'success',
                title: '¡Éxito!',
                text: 'Documento subido correctamente.'
            }).then(() => {
                $('#modalSubirDocumento').removeClass('is-active');
                $('#modalSubirDocumento').css('display', 'none');
                location.reload();
            });
        },
        error: function (xhr) {
            hideLoadingModal();
            
            console.error('Error al subir documento:', xhr);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: xhr.responseJSON?.error || 'Error al subir el documento. Por favor, intenta de nuevo.'
            });
        }
    });
});




// VISTA PREVIA DEL DOCUMENTO AL CLIC EN UNA FILA
$(document).on('click', '.fila-documento', function(e) {
    // No hacer nada si el clic fue en un botón
    if ($(e.target).closest('button, .btn-descargar').length) {
        return;
    }
    
    const documentoId = $(this).data('id');
    const tipo = $(this).data('tipo');
    const idExpediente = new URLSearchParams(window.location.search).get('id') || 
                        window.location.pathname.split('/').pop();
    const numSesion = $(this).data('sesion');
    
    if (tipo === 'NUTRICIONAL_V1') {
        // Redirigir a edición de V1 con el parámetro edit=true
        window.location.href = `/nutricion/historiaClinica/${idExpediente}?numSesion=${numSesion}&edit=true`;
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
    
    // Personalizar mensaje según el tipo
    let mensaje = '';
    if (tipo === 'NUTRICIONAL_V1') {
        mensaje = '¿Está seguro de eliminar este Historial Nutricional V1?';
    } else if (tipo === 'NUTRICIONAL_V2') {
        mensaje = '¿Está seguro de eliminar este Historial Nutricional V2?';
    } else {
        mensaje = '¿Está seguro de eliminar este documento PDF?';
    }
    
    // Mostrar un SweetAlert2 de confirmación
    Swal.fire({
        title: '¿Estás seguro?',
        text: mensaje + " Esta acción no se puede deshacer.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        reverseButtons: true
    }).then((result) => {
        if (result.isConfirmed) {
            // Mostrar modal de carga
            showLoadingModal('Eliminando', 'Por favor espere...');
            
            $.ajax({
                url: `/nutricion/documentos/eliminar/${id}?tipo=${tipo}`,
                type: 'DELETE',
                success: function() {
                    hideLoadingModal();
                    
                    // SweetAlert2 para indicar éxito
                    Swal.fire({
                        icon: 'success',
                        title: '¡Eliminado!',
                        text: `El documento ha sido eliminado.`,
                    }).then(() => {
                        location.reload();
                    });
                },
                error: function(err) {
                    hideLoadingModal();
                    
                    // SweetAlert2 para error
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: `No se pudo eliminar el documento.`,
                    });
                    console.error(err);
                }
            });
        }
    });
});

    // CERRAR MODAL DE VISTA PREVIA
    $(document).on('click', '#modalVistaPreviaDocumento .modal-background, #modalVistaPreviaDocumento .delete', function () {
        $('#modalVistaPreviaDocumento').css('display', 'none');
        $('#iframeVistaPreviaDocumento').attr('src', '');  // Limpiar el iframe cuando se cierra
    });

// Hacer que las filas de la tabla de sesiones sean clicables
$(document).on('click', '.fila-sesion', function () {
    const numSesion = $(this).data('num-sesion');
    const idExpediente = $(this).data('id-expediente');
    if (numSesion && idExpediente) {
        window.location.href = `/nutricion/historiaClinica/${idExpediente}?numSesion=${numSesion}`;
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo determinar la sesión o el expediente.'
        });
    }
});

// Centrar datos de la tabla de sesiones
$('#sesionesTable').find('td, th').css('text-align', 'center');

// Formatear fechas de la tabla de sesiones
$('#sesionesTable tbody tr').each(function () {
    const fechaCell = $(this).find('td:nth-child(2)');
    const fechaOriginal = fechaCell.text().trim();
    if (fechaOriginal) {
        const fechaFormateada = new Date(fechaOriginal).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        fechaCell.text(fechaFormateada);
    }
});
});