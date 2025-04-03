const express = require('express');
const router = express.Router();
const controller = require('../controllers/materia.controller');

// Registrar nueva materia
router.get('/registrar', controller.renderRegistrarMateriaView);
router.post('/registrar', controller.crearMateria);

// Modificar materia
router.get('/modificar', controller.renderModificarMateriaView);
router.post('/modificar', controller.actualizarMateria);

module.exports = router;
