const express = require('express');
const router = express.Router();
const controller = require('../controllers/educacion.controller');

// Centro Educativo
router.get('/', controller.renderEducacionView);
router.get('/alumnos/data', controller.getAlumnosInfo);

// Boletas
router.get('/boletas', controller.renderBoletasView);
router.get('/registrarBoleta', controller.renderRegistrarBoletaView);
router.get('/modificarBoleta', controller.renderModificarBoletaView);

// Materias (modal)
router.get('/materias', controller.renderMaterias);
router.get('/materias/obtener/:id', controller.obtenerMateria);
router.post('/materias/registrar', controller.insertMateria); 
router.post('/materias/modificar', controller.updateMateria); 
router.post('/materias/eliminar', controller.deleteMateria);

module.exports = router;
