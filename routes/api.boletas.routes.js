/**
 * Rutas para el consumo de boletas en la app móvil
 *
 * @module routes/apiBoletasRoutes
 */
const express = require('express');
const router = express.Router();
const controller = require('../controllers/api.boletas.controller');

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

module.exports = router;
