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
const nutricionalController = require('../controllers/api.nutricional.controller');
const controller = require('../controllers/api.boletas.controller');
const controller1 = require('../controllers/api.expediente.controller');
const controllerPsi = require('../controllers/api.psicologia.controller');

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

/**
 * Obtiene todas las boletas de un expediente
 * @route GET /api/boletas/:idExpediente
 */
router.get('/boletas/:idExpediente', controller.getBoletasByExpediente);

/**
 * Obtiene el detalle de una boleta con materias
 * @route GET /api/boleta/:idBoleta
 */
router.get('/boleta/:idBoleta', controller.getBoletaDetalle);

/**
 * Obtiene todas los seguimientos de un expediente
 * @route GET /api/psicologia/:idExpediente
 */
router.get('/psicologia/:idExpediente', controllerPsi.getSeguimientosPsicologia);

/**
 * Obtiene el detalle de una boleta con materias
 * @route GET /api/psicologia/detalle/:idSeguimiento
 */
router.get('/psicologia/detalle/:idSeguimiento', controllerPsi.getDetalleSeguimiento);

/**
 * Ruta para consultar expediente general
 * @route GET /api/expediente/:idExpediente
 */
router.get('/expediente/:idExpediente', controller1.getExpedienteGeneral);

/**
 * Ruta para obtener todos los datos nutricionales asociados a un expediente.
 * @route GET /api/nutricional/:idExpediente
 */
router.get('/nutricional/:idExpediente', nutricionalController.getDatosNutricionales);

module.exports = router;
