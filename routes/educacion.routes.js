const express = require('express');
const router = express.Router();
const controller = require('../controllers/educacion.controller');

router.get('/', controller.renderEducacionView);
router.get('/data', controller.getEducacionData);
router.get('/boletas', controller.renderBoletasView)
router.get('/boletas/data', controller.getBoletasData);
router.get('/materias', controller.renderMateriasView);
router.get('/materias/data', controller.getMateriasData);
router.get('/registrarBoleta', controller.renderRegistrarBoletaView);
router.get('/registrarMateria', controller.renderRegistrarMateriaView);
router.get('/modificarMateria', controller.renderModificarMateriaView);

module.exports = router;
