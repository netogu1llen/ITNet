$(document).ready(function () {
    // Inicializar DataTable para la tabla de pacientes
    const table = $('#pacientesTable').DataTable({
        language: {
            info: "Mostrando _START_ a _END_ de _TOTAL_ registros",
            infoEmpty: "No hay registros disponibles",
            infoFiltered: "(filtrado de _MAX_ registros en total)",
            paginate: {
                previous: "Anterior",
                next: "Siguiente"
            },
            lengthMenu: "Mostrar _MENU_ registros por página",
            search: "Buscar paciente:"
        },
        pageLength: 10, // Número de registros por página
        lengthMenu: [5, 10, 25, 50], // Opciones de registros por página
        order: [[0, 'asc']] // Ordenar por la primera columna (Nombre Completo)
    });

    // Crear la barra superior personalizada
    const logo = $('<img src="/images/pacientes.png" alt="Logo Pacientes" class="dt-logo">');
    const registrarButton = $('<button class="button button-create" id="btn-registrar" style="height: 30px;">Registrar Paciente</button>'); // Botón con altura ajustada
    const dtTopBar = $('<div class="dt-top-bar"></div>');

    // Agregar elementos a la barra superior
    dtTopBar.append(logo); // Agregar el logo
    $('.dataTables_length').appendTo(dtTopBar); // Mover el selector de registros por página
    $('.dataTables_filter').appendTo(dtTopBar); // Mover la barra de búsqueda al final de la barra superior
    $('.dataTables_wrapper').prepend(dtTopBar); // Insertar la barra superior antes de la tabla
    dtTopBar.append(registrarButton); // Mover el botón de registrar paciente a la barra superior

    // Evento para redirigir a la página de registro de paciente
    $(document).on('click', '#btn-registrar', function() {
        window.location.href = '/pacientes/registrar';
    });

    // Hacer que las filas sean clicables para editar (excepto el botón eliminar)
    $(document).on('click', '.fila-paciente', function(e) {
        // Evitar la redirección si se hizo clic en el botón de eliminar
        if(!$(e.target).hasClass('btn-eliminar') && !$(e.target).closest('.btn-eliminar').length) {
            const idExpediente = $(this).data('id');
            window.location.href = `/pacientes/editar/${idExpediente}`;
        }
    });

    // Función para enviar peticiones POST
    function enviarPost(url, data) {
        fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            Swal.fire({
                title: "Éxito!",
                text: data.mensaje || "Operación realizada con éxito",
                icon: "success"
            }).then(() => {
                location.reload(); // Recargar la página después de la operación
            });
        })
        .catch(error => {
            console.error("Error:", error);
            Swal.fire({
                title: "Error!",
                text: `Hubo un problema al procesar la solicitud de ${data.accion}`,
                icon: "error"
            });
        });
    }

    // Evento para eliminar paciente con confirmación
    $(document).on('click', '.btn-eliminar', function(e) {
        e.stopPropagation(); // Evitar que se propague al evento de la fila
        const idExpediente = $(this).data('id');

        // Mostrar el modal de confirmación con SweetAlert
        Swal.fire({
            title: "¿Eliminar este registro?",
            text: "Ya no podrás ver esta información",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Sí, estoy seguro",
            cancelButtonText: "Cancelar"
        }).then((result) => {
            if (result.isConfirmed) {
                enviarPost(`/pacientes/eliminar/${idExpediente}`, { accion: "eliminar" });
            }
        });
    });
});