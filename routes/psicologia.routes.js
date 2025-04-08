const express = require('express');
const router = express.Router();
const psicologiaController = require('../controllers/psicologia.controller');

router.get('/seguimientos/editar/:id', psicologiaController.get_editar_seguimiento);
router.post('/seguimientos/editar/:id', psicologiaController.post_editar_seguimiento);

// Ruta para el callback de Google
router.get('/seguimientos/registrar/:id', psicologiaController.get_registrar_seguimiento);
router.post('/seguimientos/registrar/:id', psicologiaController.post_registrar_seguimiento);

module.exports = router;