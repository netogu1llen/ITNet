$(document).ready(function () {
    // Inicializar DataTable
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
    const registrarButton = $('<button class="button button-create" style="height: 30px;">Registrar Documento</button>');
    const dtTopBar = $('<div class="dt-top-bar"></div>');

    // Agregar elementos a la barra
    dtTopBar.append(logo);
    $('.dataTables_length').appendTo(dtTopBar);
    $('.dataTables_filter').appendTo(dtTopBar);
    dtTopBar.append(registrarButton);
    $('.dataTables_wrapper').prepend(dtTopBar);

    // Acción del botón Registrar Documento
    registrarButton.on('click', function () {
        $('#modalRegistrar').css('display', 'flex'); // Abre el modal para registrar un documento
    });

    // Botón Eliminar Documento
    $('#expedientePsicologicoTable').on('click', '.btn-eliminar', function () {
        const id = $(this).data('id');
        Swal.fire({
            title: '¿Estás seguro?',
            text: 'Esta acción no se puede deshacer',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    url: `/psicologia/documentos/eliminar/${id}`,
                    type: 'DELETE',
                    success: function () {
                        Swal.fire('Eliminado', 'El documento ha sido eliminado.', 'success');
                        table.row($(this).parents('tr')).remove().draw();
                    },
                    error: function (err) {
                        Swal.fire('Error', 'No se pudo eliminar el documento.', 'error');
                        console.error(err);
                    }
                });
            }
        });
    });

    // Botón Descargar Documento
    $('#expedientePsicologicoTable').on('click', '.btn-descargar', function () {
        const id = $(this).data('id');
        window.location.href = `/psicologia/documentos/descargar/${id}`;
    });
});