document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get('error');
  
    if (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error de autenticación',
        text: decodeURIComponent(error),
        confirmButtonColor: '#F36283'
      });
    }
  });
  