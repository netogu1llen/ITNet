const { OAuth2Client } = require('google-auth-library');
const authService = require('../services/auth.service');
const { generateUserToken } = require('../util/jwt');

/**
 * Inicia el flujo de autenticación con Google OAuth.
 * Redirige al usuario a la URL de autenticación de Google.
 * @param {Object} req - Objeto de solicitud HTTP.
 * @param {Object} res - Objeto de respuesta HTTP.
 */
exports.googleAuthInit = (req, res) => {
  // Redirige a Google OAuth
  const authUrl = authService.generateGoogleAuthUrl();
  res.redirect(authUrl);
};

/**
 * Maneja el callback de Google OAuth después de la autenticación.
 * 1. Intercambia el código de autorización por un token de acceso.
 * 2. Busca o crea un usuario en la base de datos local.
 * 3. Genera un JWT para el usuario.
 * 4. Establece el JWT como cookie HTTP-only y redirige al inicio.
 * @param {Object} req - Objeto de solicitud HTTP con el código de autorización.
 * @param {Object} res - Objeto de respuesta HTTP.
 * @param {Function} next - Función para pasar errores al middleware.
 */
exports.googleCallback = async (req, res, next) => {
  const { code, error: googleError } = req.query;

  if (googleError) {
    // El usuario canceló el login en la ventana de Google
    const mensaje = 'Autenticación cancelada. Por favor intenta nuevamente.';
    return res.redirect(`/?error=${encodeURIComponent(mensaje)}`);
  }

  try {
    // Añadir log para depuración
    console.log('Código de autorización recibido:', code);

    // 1. Autenticación con Google
    const googleUser = await authService.authenticateWithGoogle(code);

    // 2. Validar que el usuario esté registrado en la BD y obtener token
    const token = await authService.handleGoogleUser(googleUser);

    // 3. Establecer cookie y redirigir
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' // Aumenta seguridad contra CSRF
    }).redirect('/home');

  } catch (error) {
    console.error('Error durante autenticación:', error.message);
    console.error(error.stack); // Opcional: para debug más detallado

    // Mensaje específico si el error es por usuario no registrado
    const mensaje = error.message.includes('no está registrado') || error.message.includes('no registrado')
      ? error.message
      : 'Ocurrió un error durante el inicio de sesión. Intenta de nuevo.';

    // Redirigir siempre al login con el mensaje de error
    return res.redirect(`/?error=${encodeURIComponent(mensaje)}`);
  }
};


/**
 * Cierra la sesión del usuario eliminando la cookie JWT.
 * @param {Object} req - Objeto de solicitud HTTP.
 * @param {Object} res - Objeto de respuesta HTTP.
 */
exports.logout = (req, res) => {
  res.clearCookie('jwt');
  res.redirect('/');
};

exports.getHome = (req, res) => {
  // Ahora puedes acceder a la información del usuario
  const userData = {
    id: req.user.id,
    email: req.user.email,
    // otros datos que hayas incluido en el token
  };
  
  // Pasar los datos del usuario a la vista
  res.render('home', { user: userData });
};

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID_ANDROID); // Usa el client ID de Android

exports.googleMobileLogin = async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({ success: false, error: 'ID no proporcionado' });
  }

  try {
    // Determinar si es email o token
    const isEmail = idToken.includes('@');
    
    let email, googleId;
    
    if (isEmail) {
      // Si es email, usarlo directamente
      email = idToken;
      googleId = null; // No tenemos ID de Google
    } else {
      // Verificar token con Google como antes
      const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID_ANDROID,
      });
      const payload = ticket.getPayload();
      email = payload.email;
      googleId = payload.sub;
    }

    // Crear un objeto googleUser similar al que espera handleGoogleUser
    const googleUser = { email: email };
    
    // Usar el método existente handleGoogleUser para gestionar el usuario
    try {
      const jwt = await authService.handleGoogleUser(googleUser);
      
      return res.status(200).json({
        token: jwt,
        expiresIn: 3600,
        success: true
      });
    } catch (error) {
      // Si el usuario no está registrado u otro error
      return res.status(401).json({
        success: false,
        error: 'Error de autenticación',
        message: error.message
      });
    }

  } catch (error) {
    console.error('Error en autenticación:', error.message);
    return res.status(401).json({
      success: false,
      error: 'Error de autenticación',
      message: error.message
    });
  }
};