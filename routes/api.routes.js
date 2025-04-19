/**
 * Rutas para el consumo de api de la aplicacion movil
 * 
 * Este módulo define las rutas relacionadas para :
 * 1. La consulta para los datos y documentos del paciente
 * 
 * Las implementaciones concretas están delegadas al controlador
 * 
 * @module routes/apiRoutes
 * @requires express
 * @requires ../controllers/api.controller
 */

const express = require('express');
const router = express.Router();
const apiController = require('../controllers/api.controller');

/**
 * Ruta que inicia el proceso de autenticación con Google OAuth 2.0
 * 
 * @name GET /api/pacientes
 * @function
 * @memberof module:routes/apiRoutes
 * @inner
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 */
router.get('/pacientes', apiController.getPacientes);

module.exports = router;
