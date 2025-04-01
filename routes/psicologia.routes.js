const express = require('express');
const router = express.Router();
const controller = require('../controllers/psicologia.controller');

// Ruta para la vista de editar seguimiento
router.get('/seguimiento', controller.getSeguimiento);

module.exports = router;
