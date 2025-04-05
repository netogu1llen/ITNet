const express = require('express');
const router = express.Router();
const psicologiaController = require('../controllers/psicologia.controller');

router.get('/seguimiento/editar/:id', psicologiaController.getSeguimiento);
router.post('/seguimiento/editar/:id', psicologiaController.actualizarSeguimiento);


// Ruta para renderizar la vista de expediente psicológico
router.get('/expediente/', psicologiaController.renderExpedientePsicologico);

// Nueva ruta para eliminar un seguimiento psicológico
router.post('/seguimiento/eliminar/:id', psicologiaController.eliminarSeguimiento);

module.exports = router;
