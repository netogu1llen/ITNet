const authService = require('../services/auth.service');
const { generateUserToken } = require('../../../utils/jwt');

exports.googleAuthInit = (req, res) => {
  // Redirige a Google OAuth
  const authUrl = authService.generateGoogleAuthUrl();
  res.redirect(authUrl);
};

exports.googleCallback = async (req, res, next) => {
  try {
    const { code } = req.query;
    
    // 1. Autenticación con Google
    const googleUser = await authService.authenticateWithGoogle(code);
    
    // 2. Gestionar usuario localmente
    const localUser = await authService.findOrCreateUser(googleUser);
    
    // 3. Generar token JWT (sin info de autorización todavía)
    const token = generateUserToken({
      id: localUser.id,
      email: localUser.email
    });
    
    // 4. Establecer cookie o enviar token
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Solo en producción
    }).redirect('/');    
    
  } catch (error) {
    next(error); // Pasa el error al middleware de errores
  }
};

exports.logout = (req, res) => {
  res.clearCookie('jwt');
  res.redirect('/login');
};