/**
 * Rutas de autenticación
 * 
 * Este módulo define las rutas relacionadas con la autenticación OAuth de Google:
 * 1. Inicio del flujo de autenticación
 * 2. Callback para procesar la respuesta de Google
 * 
 * Las implementaciones concretas están delegadas al controlador de autenticación.
 * 
 * @module routes/authRoutes
 * @requires express
 * @requires ../controllers/auth.controller
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

/**
 * Ruta que inicia el proceso de autenticación con Google OAuth 2.0
 * 
 * @name GET /auth/google
 * @function
 * @memberof module:routes/authRoutes
 * @inner
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 */
router.get('/google', authController.googleAuthInit);

/**
 * Ruta de callback que procesa la respuesta de Google después de la autenticación
 * 
 * Esta ruta:
 * 1. Recibe el código de autorización de Google
 * 2. Intercambia el código por tokens de acceso
 * 3. Gestiona la sesión del usuario
 * 
 * @name GET /auth/google/callback
 * @function
 * @memberof module:routes/authRoutes
 * @inner
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 */
router.get('/google/callback', authController.googleCallback);

module.exports = router;