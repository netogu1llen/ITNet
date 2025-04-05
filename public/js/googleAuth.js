/**
 * Manejo de autenticación con Google OAuth 2.0
 * 
 * Este módulo proporciona:
 * - Configuración e inicialización del botón de autenticación de Google
 * - Manejo de flujos exitosos y fallidos de autenticación
 * - Comunicación con el backend para validar el token
 */

/**
 * Callback ejecutado cuando la autenticación con Google es exitosa.
 * Obtiene el perfil básico del usuario y envía el token ID al backend.
 * @param {Object} googleUser - Objeto usuario retornado por la API de Google
 */
function onSuccess(googleUser) {
    console.log('Usuario logueado: ' + googleUser.getBasicProfile().getName());
    
    // Obtener el token ID de la respuesta de autenticación
    var id_token = googleUser.getAuthResponse().id_token;

    // Enviar el token al servidor para validación
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/auth/google/callback');
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send('idtoken=' + id_token);
}

/**
 * Callback ejecutado cuando falla la autenticación con Google.
 * @param {Object} error - Objeto de error proporcionado por la API de Google
 */
function onFailure(error) {
    console.error('Error en autenticación Google:', error);
}

/**
 * Configura y renderiza el botón de autenticación de Google.
 * Define los scopes solicitados y los callbacks para éxito/fracaso.
 */
function renderButton() {
    gapi.signin2.render('my-signin2', {
        'scope': 'profile email',  // Scopes solicitados a la API
        'width': 240,              // Ancho del botón en píxeles
        'height': 50,              // Alto del botón en píxeles
        'longtitle': true,         // Mostrar texto descriptivo largo
        'theme': 'dark',           // Tema visual del botón
        'onsuccess': onSuccess,    // Callback para autenticación exitosa
        'onfailure': onFailure     // Callback para errores de autenticación
    });
}

/**
 * Carga la API de autenticación de Google y la inicializa.
 * Una vez cargada, ejecuta la función para renderizar el botón.
 */
function loadGoogleAPI() {
    gapi.load('auth2', function() {
        gapi.auth2.init().then(renderButton)
            .catch(function(error) {
                console.error('Error al inicializar Google Auth:', error);
            });
    });
}

// Inicializar la carga de la API cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', loadGoogleAPI);