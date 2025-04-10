const express = require('express');
const router = express.Router();
const psicologiaController = require('../controllers/psicologia.controller');

// Ruta para editar seguimiento psicologico
router.get('/seguimientos/editar/:id', psicologiaController.getEditarSeguimiento);
router.post('/seguimientos/editar/:id', psicologiaController.postEditarSeguimiento);

// Ruta para registrar seguimiento psicologico
router.get('/seguimientos/registrar/:id', psicologiaController.getRegistrarSeguimiento);
router.post('/seguimientos/registrar/:id', psicologiaController.postRegistrarSeguimiento);

module.exports = router;
