/**
 * Middleware para autenticación con JWT (JSON Web Token).
 * Verifica la presencia y validez de un token JWT en las cookies de la solicitud.
 * 
 * Si el token es válido, decodifica la información del usuario y la adjunta al objeto `req`.
 * Si el token no existe o es inválido, redirige al usuario a la página principal.
 * Para solicitudes API, devuelve respuestas JSON de error.
 * 
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} res - Objeto de respuesta de Express.
 * @param {Function} next - Función para pasar el control al siguiente middleware.
 * @return {void} Redirige al usuario o pasa al siguiente middleware.
 */
const { verifyToken } = require('../util/jwt');

const authenticateJWT = (req, res, next) => {
  // Determinar si es una solicitud de API o una solicitud de vista
  const isApiRequest = req.path.startsWith('/api') || 
                      req.xhr || 
                      req.headers.accept === 'application/json';

  // Prioridad 1: token en cookie (web)
  let token = req.cookies?.jwt;

  // Prioridad 2: token en header Authorization (móvil)
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }

  // Si no hay token
  if (!token) {
    if (isApiRequest) {
      // Para API, responder con JSON
      return res.status(401).json({ error: 'Token no proporcionado. Acceso denegado.' });
    } else {
      // Para solicitudes web, redirigir a la página principal
      return res.redirect('/?error=' + encodeURIComponent('Sesión expirada. Por favor inicie sesión nuevamente.'));
    }
  }

  try {
    // Verifica y decodifica el token usando la clave secreta de entorno
    const decoded = verifyToken(token);
    
    // Adjunta la información del usuario decodificada al objeto de solicitud
    req.user = decoded;

    // Pasa el control al siguiente middleware
    next();
  } catch (err) {
    // Limpiar la cookie JWT expirada
    res.clearCookie('jwt');
    
    if (isApiRequest) {
      // Para API, responder con JSON
      return res.status(403).json({ error: 'Token inválido o expirado.' });
    } else {
      // Para solicitudes web, redirigir a la página principal
      return res.redirect('/?error=' + encodeURIComponent('Su sesión ha expirado. Por favor inicie sesión nuevamente.'));
    }
  }
};

module.exports = authenticateJWT;