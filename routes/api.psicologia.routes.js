const express = require('express');
const router = express.Router();
const controller = require('../controllers/api.psicologia.controller')

router.get('/:idExpediente', controller.getSeguimientosPsicologia);

router.get('/detalle/:idSeguimiento', controller.getDetalleSeguimiento);

module.exports = router;