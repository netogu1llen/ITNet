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
  try {
    const { code } = req.query;

    // 1. Autenticación con Google
    const googleUser = await authService.authenticateWithGoogle(code);

    // 2. Validar que el usuario esté registrado en la BD
    const localUser = await authService.handleGoogleUser(googleUser);

    // 3. Generar token JWT
    const token = generateUserToken({
      id: localUser.id,
      email: localUser.email
    });

    // 4. Establecer cookie y redirigir
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    }).redirect('/');
    
  } catch (error) {
    if (error.message.includes('no está registrado')) {
      return res.status(403).send('Tu cuenta no tiene acceso. Contacta al administrador.');
    }

    next(error); // Otros errores se mandan al middleware
  }
};

/**
 * Cierra la sesión del usuario eliminando la cookie JWT.
 * @param {Object} req - Objeto de solicitud HTTP.
 * @param {Object} res - Objeto de respuesta HTTP.
 */
exports.logout = (req, res) => {
  res.clearCookie('jwt');
  res.redirect('/login');
};
