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
// Corregir la ruta de importación si es necesario
const authController = require('../controllers/authController');
const authenticateJWT = require('../middlewares/authenticateJWT');

// Ruta para mostrar el login
router.get('/', (req, res) => {
    // Obtener mensaje de error de la URL si existe
    const error = req.query.error || null;
    
    res.render('login', {
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,  // Pasar la variable GOOGLE_CLIENT_ID desde .env
        error: error // Pasar el mensaje de error a la vista
    });
});

// Rutas principales
router.get('/home', authenticateJWT, authController.getHome);

/**
 * Ruta para depuración - Muestra el contenido completo de req.user
 * NOTA: Esta ruta es solo para desarrollo y debe eliminarse en producción
 */
router.get('/debug/user', authenticateJWT, (req, res) => {
    res.json({
        user: req.user,
        tokenInfo: {
            expiresAt: req.user.exp ? new Date(req.user.exp * 1000).toISOString() : null,
            issuedAt: req.user.iat ? new Date(req.user.iat * 1000).toISOString() : null,
        },
        requestInfo: {
            headers: req.headers,
            cookies: req.cookies
        }
    });
});

/**
 * Middleware de depuración temporal para ver el contenido de req.user en la consola
 */
const debugUserMiddleware = (req, res, next) => {
    console.log('===== CONTENIDO DE REQ.USER =====');
    console.log(JSON.stringify(req.user, null, 2));
    console.log('=================================');
    next();
};

// Ruta de home con middleware de depuración
router.get('/home-debug', authenticateJWT, debugUserMiddleware, authController.getHome);

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

router.post('/google/mobile', authController.googleMobileLogin);

module.exports = router;