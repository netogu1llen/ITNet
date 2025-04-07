const express = require('express');
const router = express.Router();
const psicologiaController = require('../controllers/psicologia.controller');

// Ruta para obtener documentos por expediente
router.get('/documentos/:idExpediente', psicologiaController.obtenerDocumentosPorExpediente);

module.exports = router;