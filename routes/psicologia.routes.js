const express = require('express');
const router = express.Router();
const psicologiaController = require('../controllers/psicologia.controller');

// Ruta para el callback de Google
router.get('/seguimientos/registrar', psicologiaController.get_registrar_seguimiento);

module.exports = router;