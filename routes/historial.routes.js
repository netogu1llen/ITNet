const express = require('express');
const router = express.Router();
const { getHistorialExpedientes } = require('../controllers/historial.controller');

// Ruta para mostrar el historial de expedientes
router.get('/historial-expedientes', getHistorialExpedientes);

module.exports = router;
