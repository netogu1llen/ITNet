const express = require('express');
const router = express.Router();
const controller = require('../controllers/api.expediente.controller');

/**
 * Ruta para consultar expediente general
 * @route GET /api/expediente/:idExpediente
 */
router.get('/expediente/:idExpediente', controller.getExpedienteGeneral);

module.exports = router;