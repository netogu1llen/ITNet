
  // Mantener la función para agregar filas al psicograma
  document.getElementById('btn-agregar-fila')?.addEventListener('click', function(e) {
    e.preventDefault();
    
    const tabla = document.getElementById('table');
    const nuevaFila = document.createElement('tr');
    
    nuevaFila.innerHTML = `
    <td>
        <div class="multirow-form-container">
            <textarea name="actividad" required rows="3" required></textarea>
        </div>
    </td>
    <td>
        <div class="multirow-form-container">
            <textarea name="tiempo" required rows="3" required></textarea>
        </div>
    </td>
    <td>
        <div class="multirow-form-container">
            <textarea name="metodologia" required rows="3" required></textarea>
        </div>
    </td>
    <td>
        <div class="multirow-form-container">
            <textarea name="objetivoActividad" required rows="3" required></textarea>
        </div>
    </td>
    <td>
        <div class="multirow-form-container">
            <textarea name="observaciones" required rows="3" required></textarea>
        </div>
    </td>
    <button class="button is-cancel" type="button">-</button>
    </td>
    `;
    tabla.appendChild(nuevaFila);
    
    // Evento para eliminar fila
    nuevaFila.querySelector('.is-cancel').addEventListener('click', function() {
      tabla.removeChild(nuevaFila);
    });
  });
  