document.addEventListener('DOMContentLoaded', function () {
    const homeButton = document.getElementById('homeButton');
    const sidebar = document.getElementById('sidebar');

    // Desplegar sidebar al acercar el cursor
    sidebar.addEventListener('mouseenter', function() {
        sidebar.classList.add('is-active');
    });

    // Ocultar sidebar al alejar el cursor
    sidebar.addEventListener('mouseleave', function() {
        sidebar.classList.remove('is-active');
    });

    // Asegurar que el botón home redirija a /home
    homeButton.addEventListener('click', function(event) {
        window.location.href = '/home';
    });
});