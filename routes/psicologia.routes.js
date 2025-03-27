const express = require('express');
const router = express.Router();
const controller = require('../controllers/psicologia.controller');

router.get('/', controller.renderNutricionView);

module.exports = router;