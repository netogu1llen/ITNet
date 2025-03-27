const express = require('express');
const router = express.Router();
const nutricionController = require('../controllers/nutricionController');

// Ruta para el callback de Google
router.get('/expediente', nutricionController.getExpedienteNutricion);

module.exports = router;