const express = require('express');
const router = express.Router();
const psicologiaController = require('../controllers/psicologia.controller');

router.get('/seguimiento/editar/:id', psicologiaController.getSeguimiento);
router.post('/seguimiento/editar/:id', psicologiaController.actualizarSeguimiento);

module.exports = router;
