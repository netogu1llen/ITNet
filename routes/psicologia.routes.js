const express = require('express');
const router = express.Router();
const psicologiaController = require('../controllers/psicologia.controller');

router.get('/seguimiento/editar/:id', psicologiaController.getSeguimiento);

module.exports = router;
