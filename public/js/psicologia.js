// Actualizar la función cambiarPagina para manejar 3 páginas
function cambiarPagina(numeroPagina) {
  // Ocultar todas las páginas
  document.querySelectorAll('.entrevista-pagina').forEach(pagina => {
    pagina.style.display = 'none';
  });
  
  // Mostrar la página seleccionada
  document.getElementById(`pagina-${numeroPagina}`).style.display = 'block';
  
  // Actualizar botones de paginación
  document.querySelectorAll('.entrevista-page-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.pagina === numeroPagina.toString()) {
      btn.classList.add('active');
    }
  });
}

// Eventos para los botones de paginación
document.querySelectorAll('.entrevista-page-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    const accion = this.dataset.pagina;
    const paginaActual = parseInt(document.querySelector('.entrevista-page-btn.active').dataset.pagina);
    let nuevaPagina;
    
    if (accion === 'anterior') {
      nuevaPagina = Math.max(1, paginaActual - 1);
    } else if (accion === 'siguiente') {
      nuevaPagina = Math.min(3, paginaActual + 1);
    } else {
      nuevaPagina = parseInt(accion);
    }
    
    cambiarPagina(nuevaPagina);
  });
});

// Mantener la función para agregar filas al psicograma
document.getElementById('btn-agregar-fila')?.addEventListener('click', function(e) {
  e.preventDefault();
  
  const tabla = document.getElementById('tabla-psicograma');
  const nuevaFila = document.createElement('tr');
  
  nuevaFila.innerHTML = `
    <td><input type="text" class="entrevista-input" name="psicograma_nombre[]"></td>
    <td><input type="text" class="entrevista-input" name="psicograma_parentesco[]"></td>
    <td><input type="number" class="entrevista-input" name="psicograma_edad[]"></td>
    <td><input type="text" class="entrevista-input" name="psicograma_ocupacion[]"></td>
    <td><input type="text" class="entrevista-input" name="psicograma_escolaridad[]"></td>
    <td><input type="text" class="entrevista-input" name="psicograma_caracter[]"></td>
    <td><input type="text" class="entrevista-input" name="psicograma_sentimiento[]"></td>
    <td>
      <input type="text" class="entrevista-input" name="psicograma_relacion[]">
      <button class="btn-eliminar-fila" type="button">✕</button>
    </td>
  `;
  
  tabla.appendChild(nuevaFila);
  
  // Evento para eliminar fila
  nuevaFila.querySelector('.btn-eliminar-fila').addEventListener('click', function() {
    tabla.removeChild(nuevaFila);
  });
});

// Inicializar mostrando la página 1
cambiarPagina(1);