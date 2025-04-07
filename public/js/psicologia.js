document.getElementById('btn-guardar')?.addEventListener('click', function () {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "¿Deseas guardar los cambios?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, guardar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        document.getElementById('form-seguimiento').submit();
      }
    });
  });
  

document.getElementById('btn-agregar-fila')?.addEventListener('click', function(e) {
    e.preventDefault();
    
    const tabla = document.getElementById('table');
    const nuevaFila = document.createElement('tr');
    
    // Obtener el índice de la nueva fila
    const index = tabla.rows.length;
  
    nuevaFila.innerHTML = `
      <td>
          <div class="multirow-form-container">
              <textarea name="actividad[${index}]" required rows="3"></textarea>
          </div>
      </td>
      <td>
          <div class="multirow-form-container">
              <textarea name="tiempo[${index}]" required rows="3"></textarea>
          </div>
      </td>
      <td>
          <div class="multirow-form-container">
              <textarea name="metodologia[${index}]" required rows="3"></textarea>
          </div>
      </td>
      <td>
          <div class="multirow-form-container">
              <textarea name="objetivoActividad[${index}]" required rows="3"></textarea>
          </div>
      </td>
      <td>
          <div class="multirow-form-container">
              <textarea name="observaciones[${index}]" required rows="3"></textarea>
          </div>
      </td>
      <td>
          <button class="button is-cancel" type="button">-</button>
      </td>
    `;
    
    tabla.appendChild(nuevaFila);
    
    // Evento para eliminar fila
    nuevaFila.querySelector('.is-cancel').addEventListener('click', function() {
      tabla.removeChild(nuevaFila);
    });
  });
  

  const params = new URLSearchParams(window.location.search);
  const estado = params.get('estado');

  if (estado === 'exito') {
    Swal.fire({
      title: '¡Guardado exitosamente!',
      text: 'Los cambios han sido actualizados.',
      icon: 'success',
      confirmButtonText: 'OK'
    });
  }

  if (estado === 'error') {
    Swal.fire({
      title: '¡Error!',
      text: 'Hubo un problema al guardar los datos.',
      icon: 'error',
      confirmButtonText: 'Reintentar'
    });
  }