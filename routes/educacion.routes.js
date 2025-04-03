const express = require('express');
const router = express.Router();
const controller = require('../controllers/educacion.controller');

router.get('/', controller.renderEducacionView);
router.get('/data', controller.getEducacionData);
router.get('/boletas', controller.renderBoletasView)
router.get('/boletas/data', controller.getBoletasData);
router.get('/registrar-materia', controller.renderRegistrarMateriaView);


module.exports = router;
