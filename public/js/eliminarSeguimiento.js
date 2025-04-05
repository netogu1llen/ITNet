document.addEventListener('DOMContentLoaded', () => {
  const botonesEliminar = document.querySelectorAll('.btn-eliminar');

  botonesEliminar.forEach((boton) => {
      boton.addEventListener('click', async () => {
          const idSeguimiento = boton.getAttribute('data-id'); // Obtén el ID del atributo data-id

          const resultado = await Swal.fire({
              title: '¿Estás seguro?',
              text: 'Esta acción no se puede deshacer',
              icon: 'warning',
              showCancelButton: true,
              confirmButtonColor: '#d33',
              cancelButtonColor: '#3085d6',
              confirmButtonText: 'Sí, eliminar',
              cancelButtonText: 'Cancelar',
          });

          if (resultado.isConfirmed) {
              try {
                  // Envía la solicitud POST con el ID en la URL
                  const respuesta = await fetch(`/psicologia/seguimiento/eliminar/${idSeguimiento}`, {
                      method: 'POST',
                      headers: {
                          'Content-Type': 'application/json',
                      },
                  });

                  const data = await respuesta.json();

                  if (respuesta.ok) {
                      Swal.fire('Eliminado', data.message, 'success');
                  } else {
                      Swal.fire('Error', data.error || 'No se pudo eliminar el seguimiento', 'error');
                  }
              } catch (error) {
                  Swal.fire('Error', 'Ocurrió un error al intentar eliminar el seguimiento', 'error');
              }
          }
      });
  });
});