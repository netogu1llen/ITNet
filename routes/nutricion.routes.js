const express = require('express');
const router = express.Router();
<<<<<<< HEAD
const nutricionController = require('../controllers/nutricionController');

// Ruta para el callback de Google
router.get('/expediente', nutricionController.getExpedienteNutricion);

module.exports = router;
=======
const controller = require('../controllers/nutricion.controller');

router.get('/', controller.renderNutricionView);
router.get('/data', controller.getNutricionData);

// Ruta para la vista de planes alimenticios
router.get('/planes-alimenticios', controller.renderPlanesAlimenticios);
// Ruta para obtener los datos de planes alimenticios
router.get('/planes-alimenticios/data', controller.getPlanesAlimenticiosData);

module.exports = router;
>>>>>>> develop
