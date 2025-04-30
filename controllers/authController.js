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
    // IMPORTANTE: No redeclarar 'code' aquí, ya está declarado arriba
    // const { code } = req.query; <- ELIMINAR ESTA LÍNEA

    // Añadir log para depuración
    console.log('Código de autorización recibido:', code);

    // 1. Autenticación con Google
    const googleUser = await authService.authenticateWithGoogle(code);
    console.log('Información de usuario de Google:', JSON.stringify(googleUser, null, 2));

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
    return res.status(400).json({ error: 'Token ID no proporcionado' });
  }

  try {
    // Verificar token con Google
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID_ANDROID,
    });

    const payload = ticket.getPayload();
    const { email, sub: googleId, name, picture } = payload;

    // Verifica si el usuario existe en la base de datos
    const localUser = await authService.handleGoogleUser({
      email,
      googleId,
      name,
    });

    // Genera el JWT propio
    const token = generateUserToken({
      id: localUser.id,
      email: localUser.email,
    });

    return res.status(200).json({ token });

  } catch (error) {
    console.error('Error verificando token de Google:', error.message);
    return res.status(401).json({ error: 'Token inválido' });
  }
};