$(document).ready(function () {
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
            // Destacar visualmente los documentos Historial Clínico V1
            if($(row).find('td:first').text().trim().includes('Historial Clínico V1')) {
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
            
            // Si es un Historial Clínico V1, moverlo al principio
            if (tipo.includes('Historial Clínico V1')) {
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

    // Asegurarse de que estamos trabajando con el ID correcto
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
    } else {
        // Cargar la gráfica de evolución de peso y talla
        fetch(`/nutricion/evolucion/${idExpediente}`)
            .then(response => response.json())
            .then(data => {
                if (!data || data.length === 0) {
                    console.log('No hay datos para mostrar la gráfica');
                    $('#graficaPesoTallaContainer').hide();
                    return;
                }
            
                // Filtrar solo los registros válidos (peso, talla y fecha deben ser válidos)
                const registrosValidos = data.filter(item => {
                    const pesoValido = item.peso !== null && !isNaN(item.peso);
                    const tallaValida = item.talla !== null && !isNaN(item.talla);
                    const fechaValida = item.fecha !== null && !isNaN(new Date(item.fecha).getTime());
                    return pesoValido && tallaValida && fechaValida;
                });
            
                if (registrosValidos.length < 2) {
                    console.log('No hay suficientes datos válidos para mostrar la gráfica (se requieren al menos 2 mediciones válidas)');
                    $('#graficaPesoTallaContainer').hide();  // Ocultar toda la sección de la gráfica
                    return;
                }
            
                // Solo graficamos los datos válidos
                const fechas = registrosValidos.map(item => new Date(item.fecha).toLocaleDateString('es-ES'));
                const pesos = registrosValidos.map(item => item.peso);
                const tallas = registrosValidos.map(item => item.talla);

                const ctx = document.getElementById('graficaEvolucionPesoTalla').getContext('2d');
                new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: fechas,
                        datasets: [
                            {
                                label: 'Peso (kg)',
                                data: pesos,
                                borderWidth: 2,
                                tension: 0.2
                            },
                            {
                                label: 'Talla (cm)',
                                data: tallas,
                                borderWidth: 2,
                                tension: 0.2
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: { position: 'top' },
                            title: { display: false }
                        }
                    }
                });
            })
            .catch(error => {
                console.error('Error al obtener los datos de evolución:', error);
            });
    }

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

    // Función para limpiar el formulario de documentos
    function limpiarFormularioDocumentos() {
        // Resetear el formulario
        $('#subirDocumentoForm')[0].reset();
        
        // Limpiar el mensaje de archivos seleccionados
        $('#nombreArchivo').text('No hay archivos seleccionados');
        
        // Limpiar la lista de archivos
        $('#listaArchivosSeleccionados').empty();
    }

    // Evento para el botón Nueva Sesión
    nuevaSesionButton.on('click', function() {
        console.log("Abriendo modal de subir documento");
        limpiarFormularioDocumentos();
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
        limpiarFormularioDocumentos();
    });

    // MOSTRAR NOMBRES DE LOS ARCHIVOS
    $(document).on('change', 'input[name="archivosDocumento"]', function () {
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

    // ENVÍO DEL FORMULARIO - VERSIÓN PARA MÚLTIPLES ARCHIVOS
    $('#subirDocumentoForm').on('submit', function (e) {
        e.preventDefault();
        console.log('Formulario enviado');
        
        const archivos = $('input[name="archivosDocumento"]')[0].files;
        console.log('Archivos seleccionados:', archivos.length);
        
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
        
        // Obtener el ID del expediente
        let idExpediente = new URLSearchParams(window.location.search).get('id');
        
        if (!idExpediente) {
            const urlPath = window.location.pathname;
            const segments = urlPath.split('/');
            idExpediente = segments[segments.length - 1];
        }
        
        if (!idExpediente || isNaN(parseInt(idExpediente))) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo determinar el ID del expediente.'
            });
            return;
        }
        
        console.log('ID de expediente para subir:', idExpediente);
        
        // Mostrar modal de carga
        showLoadingModal('Subiendo archivos', `Subiendo ${archivos.length} documento(s)...`);
        
        const formData = new FormData();
        
        // Agregar todos los archivos al FormData
        for (let i = 0; i < archivos.length; i++) {
            formData.append('archivosDocumento', archivos[i]);
        }
        
        $.ajax({
            url: `/nutricion/documentos/subir-multiple/${idExpediente}`,
            method: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function (response) {
                hideLoadingModal();
                console.log('Respuesta del servidor:', response);
                
                Swal.fire({
                    icon: 'success',
                    title: '¡Éxito!',
                    text: `${archivos.length} documento(s) subido(s) correctamente.`
                }).then(() => {
                    $('#modalSubirDocumento').css('display', 'none');
                    limpiarFormularioDocumentos();
                    location.reload();
                });
            },
            error: function (xhr) {
                hideLoadingModal();
                console.error('Error al subir documentos:', xhr);
                
                let mensaje = 'Error al subir los documentos. Por favor, intenta de nuevo.';
                if (xhr.responseJSON && xhr.responseJSON.error) {
                    mensaje = xhr.responseJSON.error;
                }
                
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: mensaje
                });
            }
        });
    });

    // Hacer global las funciones de modal para los eventos fuera del document.ready
    window.showLoadingModal = showLoadingModal;
    window.hideLoadingModal = hideLoadingModal;
});

// VISTA PREVIA DEL DOCUMENTO AL CLIC EN UNA FILA
$(document).on('click', '.fila-documento', function(e) {
    // No hacer nada si el clic fue en un botón
    if ($(e.target).closest('button, .btn-descargar, .btn-eliminar').length) {
        return;
    }
    
    const documentoId = $(this).data('id');
    const tipo = $(this).data('tipo');
    const numSesion = $(this).data('sesion'); // Asegurarnos de obtener el numSesion
    const idExpediente = new URLSearchParams(window.location.search).get('id') || 
                        window.location.pathname.split('/').pop();
    
    if (tipo === 'NUTRICIONAL_V1') {
        window.location.href = `/nutricion/historiaClinica/edit/${idExpediente}?numSesion=${numSesion}&edit=true`;
    } else if (tipo === 'NUTRICIONAL_V2') {
        window.location.href = `/nutricion/historiaClinicaV2/${idExpediente}?numSesion=${numSesion}`;
    } else if (tipo === 'PDF') {
        // Código existente para PDF...
        console.log('Ver documento PDF:', documentoId);
        const url = `${window.location.origin}/nutricion/documentos/ver/${documentoId}`;
        const iframe = $('#iframeVistaPreviaDocumento');
        iframe.attr('src', 'about:blank');
        $('#modalVistaPreviaDocumento').css('display', 'flex');
        setTimeout(() => {
            iframe.attr('src', url);
        }, 100);
    }
});

// Modificar la función para el botón de descarga
$(document).on('click', '.btn-descargar', function(event) {
    event.preventDefault();
    event.stopPropagation();
    
    const button = $(this);
    const documentoId = button.attr('data-id');
    const tipo = button.attr('data-tipo');
    const numSesion = button.attr('data-num-sesion');
    const idExpediente = button.attr('data-expediente');
    
    console.log('Datos para descarga:', {
        documentoId,
        tipo,
        numSesion,
        idExpediente
    });
    
    if (!numSesion && tipo.includes('NUTRICIONAL')) {
        console.error('No se encontró el número de sesión para el documento:', documentoId);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo determinar el número de sesión del documento'
        });
        return;
    }
    
    showLoadingModal('Preparando descarga', 'Por favor espere mientras se prepara el documento...');
    
    // Construir URL con todos los parámetros
    const downloadUrl = `/nutricion/documentos/descargar/${documentoId}?tipo=${tipo}&numSesion=${numSesion}&expediente=${idExpediente}`;
    
    // Realizar la descarga
    $.ajax({
        url: downloadUrl,
        method: 'GET',
        xhrFields: {
            responseType: 'blob'
        },
        success: function(data) {
            hideLoadingModal();
            
            const blob = new Blob([data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            
            // Nombre del archivo según el tipo
            let filename;
            if (tipo === 'NUTRICIONAL_V1') {
                filename = `historial_clinico_v1_sesion_${numSesion}.pdf`;
            } else if (tipo === 'NUTRICIONAL_V2') {
                filename = `historial_clinico_v2_sesion_${numSesion}.pdf`;
            } else {
                filename = `documento_${documentoId}.pdf`;
            }
            
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            
            setTimeout(() => {
                window.URL.revokeObjectURL(url);
                document.body.removeChild(link);
            }, 100);
        },
        error: function(xhr) {
            hideLoadingModal();
            console.error('Error en la descarga:', xhr);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo descargar el documento. Por favor, intente nuevamente.'
            });
        }
    });
});

// Botón Eliminar Documento
$(document).on('click', '.btn-eliminar', function(event) {
    event.preventDefault();
    event.stopPropagation(); // Evitar que se active la vista previa
    
    const id = $(this).data('id');
    const tipo = $(this).data('tipo');
    
    // No permitir eliminar historiales V1 (verificación adicional por seguridad)
    if (tipo === 'NUTRICIONAL_V1') {
        Swal.fire({
            icon: 'error',
            title: 'Operación no permitida',
            text: 'No es posible eliminar un Historial Clínico V1.'
        });
        return;
    }
    
    // Personalizar mensaje según el tipo
    let mensaje = '';
    if (tipo === 'NUTRICIONAL_V2') {
        mensaje = '¿Está seguro de eliminar este Historial Clínico V2?';
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