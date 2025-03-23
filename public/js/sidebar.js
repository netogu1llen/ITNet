document.addEventListener('DOMContentLoaded', function () {
    const burgerButton = document.getElementById('burgerButton');
    const sidebar = document.getElementById('sidebar');

    burgerButton.addEventListener('click', function () {
        sidebar.classList.toggle('is-active');
    });
});