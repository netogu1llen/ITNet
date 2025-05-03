$(document).ready(function () {
  // Inicializar DataTable para la tabla de nutrición
  const table = $('#nutricionTable').DataTable({
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
  const logo = $('<img src="/images/manzana.png" alt="Logo Nutrición" class="dt-logo">');
  const dtTopBar = $('<div class="dt-top-bar"></div>');

  // Agregar elementos a la barra superior
  dtTopBar.append(logo);
  $('.dataTables_length').appendTo(dtTopBar);
  $('.dataTables_filter').appendTo(dtTopBar);
  $('.dataTables_wrapper').prepend(dtTopBar);

  // Hacer que las filas sean clicables para ver documentos de nutrición
  $(document).on('click', '.fila-paciente', function(e) {
      // Evitar que el clic en el botón de eliminar active la navegación
      if(!$(e.target).hasClass('btn-eliminar') && !$(e.target).closest('.btn-eliminar').length) {
          const idExpediente = $(this).data('id');
          window.location.href = `/nutricion/documentos/${idExpediente}`;
      }
  });

  // Evento para eliminar paciente con confirmación
  $(document).on('click', '.btn-eliminar', function(e) {
      e.stopPropagation(); // Importante: evita que el evento de clic se propague a la fila
      const idExpediente = $(this).data('id');

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
              fetch(`/nutricion/eliminar/${idExpediente}`, {
                  method: "POST",
                  headers: {
                      "Content-Type": "application/json"
                  },
                  body: JSON.stringify({ accion: "eliminar" })
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
                      text: "Hubo un problema al procesar la solicitud",
                      icon: "error"
                  });
              });
          }
      });
  });
});