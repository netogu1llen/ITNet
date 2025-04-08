const express = require('express');
const router = express.Router();
const controller = require('../controllers/nutricion.controller');

router.get('/', controller.renderNutricionView);
router.get('/data', controller.getNutricionData);

// Ruta para la vista de planes alimenticios
router.get('/planesAlimenticios', controller.renderPlanesAlimenticios);
// Ruta para obtener los datos de planes alimenticios
router.get('/planesAlimenticios/data', controller.getPlanesAlimenticiosData);

module.exports = router;
