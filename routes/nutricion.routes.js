const express = require('express');
const router = express.Router();
const controller = require('../controllers/nutricion.controller');

router.get('/', controller.renderNutricionView);
router.get('/data', controller.getNutricionData);

module.exports = router;
