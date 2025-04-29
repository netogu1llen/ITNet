/**
 * Middleware para autenticación con JWT (JSON Web Token).
 * Verifica la presencia y validez de un token JWT en las cookies de la solicitud.
 * 
 * Si el token es válido, decodifica la información del usuario y la adjunta al objeto `req`.
 * Si el token no existe o es inválido, devuelve una respuesta de error apropiada.
 * 
 * @param {Object} req - Objeto de solicitud de Express.
 * @param {Object} res - Objeto de respuesta de Express.
 * @param {Function} next - Función para pasar el control al siguiente middleware.
 * @return {void|Object} Si hay error, devuelve respuesta JSON con código de estado.
 */
const { verifyToken } = require('../util/jwt');

const authenticateJWT = (req, res, next) => {
  // Prioridad 1: token en cookie (web)
  // Obtiene el token JWT de las cookies de la solicitud
  // El operador ?. es para manejar casos donde req.cookies pueda ser undefined
  let token = req.cookies?.jwt;

  // Prioridad 2: token en header Authorization (móvil)
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }

  // Si no hay token, devuelve error 401 (No autorizado)
  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado. Acceso denegado.' });
  }

  try {
    // Verifica y decodifica el token usando la clave secreta de entorno
    const decoded = verifyToken(token);
    
    // Adjunta la información del usuario decodificada al objeto de solicitud
    // El token debería contener información básica del usuario (id, email, etc.)
    req.user = decoded;

    // Pasa el control al siguiente middleware
    next();
  } catch (err) {
    // Si el token es inválido o ha expirado, devuelve error 403 (Prohibido)
    return res.status(403).json({ error: 'Token inválido o expirado.' });
  }
};

module.exports = authenticateJWT;