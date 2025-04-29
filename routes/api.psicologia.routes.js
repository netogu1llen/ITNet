/**
 * Rutas para el consumo de psicologia en la app móvil
 *
 * @module routes/apiPsicologiaRoutes
 */
const express = require('express');
const router = express.Router();
const controller = require('../controllers/api.psicologia.controller');

/**
 * Obtiene todas los documentos de un expediente de psicologia
 * @route GET /api/psicologia/:idExpediente
 */
router.get('/psicologia/:IDExpediente', controller.getSeguimientoByExpediente);

/**
 * Obtiene el detalle de seguimiento
 * @route GET /api/psicologia/:IDSeguimiento
 */
router.get('/psicologia/:IDSeguimiento', controller.getSeguimientoDetalle);

module.exports = router;