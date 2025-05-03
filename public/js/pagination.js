// Paginacion para todas las vistas
document.addEventListener('DOMContentLoaded', function() {
    const paginas = document.querySelectorAll('.entrevista-pagina');
    const totalPaginas = paginas.length;
    
    // Si solo hay una página, eliminar la paginación
    if (totalPaginas <= 1) {
      document.querySelector('.pagination')?.remove();
      return;
    }
  
    // Referencias a los elementos de paginación
    const btnPrev = document.getElementById('pagina-anterior');
    const btnNext = document.getElementById('pagina-siguiente');
    const pageLinks = document.querySelectorAll('.pagination-link');
    
    let paginaActual = 1;
  
    // Función para mostrar una página específica
    function showPage(pageNum) {
      // Validar el número de página
      pageNum = Math.max(1, Math.min(pageNum, totalPaginas));
      
      // Ocultar todas las páginas y mostrar la actual
      paginas.forEach((pagina, index) => {
        pagina.style.display = index === pageNum - 1 ? 'block' : 'none';
      });
      
      // Actualizar estado de los botones
      pageLinks.forEach(link => {
        const linkPage = parseInt(link.dataset.pagina);
        link.classList.toggle('is-current', linkPage === pageNum);
      });
      
      // Actualizar botones anterior/siguiente
      btnPrev.disabled = pageNum === 1;
      btnNext.disabled = pageNum === totalPaginas;
      
      paginaActual = pageNum;
    }
  
    // Event listeners
    pageLinks.forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        showPage(parseInt(link.dataset.pagina));
      });
    });

    btnPrev.addEventListener('click', () => showPage(paginaActual - 1));
    btnNext.addEventListener('click', () => showPage(paginaActual + 1));
  
    // Mostrar primera página al cargar
    showPage(1);
  });