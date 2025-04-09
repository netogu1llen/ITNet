/**
 * Módulo para manejo de tokens JWT (JSON Web Token).
 * Proporciona funciones para generar y verificar tokens de autenticación.
 */
const jwt = require('jsonwebtoken');

// Configuración de JWT
const JWT_SECRET = process.env.JWT_SECRET; // Clave secreta para firmar tokens (debe definirse en variables de entorno)
const JWT_EXPIRES_IN = '7d'; // Expiración del token (7 días en este caso)

/**
 * Genera un token JWT con los datos del usuario.
 * El token incluye un timestamp de expiración y está firmado con la clave secreta.
 * 
 * @param {Object} payload - Datos del usuario que se incluirán en el token (ej. id, email, roles).
 * @return {string} Token JWT firmado y con expiración.
 * @throws {Error} Si JWT_SECRET no está definido o hay error en la generación.
 */
function generateUserToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verifica la validez de un token JWT.
 * Comprueba la firma y la fecha de expiración.
 * 
 * @param {string} token - Token JWT a verificar.
 * @return {Object} Payload decodificado del token si la verificación es exitosa.
 * @throws {jwt.JsonWebTokenError} Si el token es inválido o está manipulado.
 * @throws {jwt.TokenExpiredError} Si el token ha expirado.
 */
function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

// Exportación de las funciones del módulo
module.exports = {
  generateUserToken,
  verifyToken
};