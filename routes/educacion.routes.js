const express = require('express');
const router = express.Router();

const canVerExpediente = require('../util/can-verExpediente');
const canRegistrarBoleta = require('../util/can-registrarBoleta');
const canEditarBoleta = require('../util/can-editarBoleta');
const canEliminarBoleta = require('../util/can-eliminarBoleta');
const canConsultarBoletas = require('../util/can-consultarBoletas');
const canRegistrarMateria = require('../util/can-registrarMateria');
const canEditarMateria = require('../util/can-editarMateria');
const canEliminarMateria = require('../util/can-eliminarMateria');
const canEditarCalificacion = require('../util/can-editarCalificacion');

const controller = require('../controllers/educacion.controller');

// ========== VISTA PRINCIPAL ==========
router.get('/', controller.renderEducacionView);
router.get('/alumnos/data', controller.getAlumnosInfo);

// ========== MATERIAS ==========
router.get('/materias', controller.renderMaterias);
router.get('/materias/lista', controller.getMateriasList);
router.get('/materias/:id', controller.getMateriaById);
router.get('/materias/obtener/:id', controller.obtenerMateria);
router.post('/materias/registrar', controller.insertMateria);
router.post('/materias/modificar', controller.updateMateria);
router.post('/materias/eliminar', controller.deleteMateria);

// ========== BOLETAS ==========
router.get('/boletas', controller.renderBoletasView);
router.post('/boletas/registrar', controller.registrarBoleta);
router.get('/boletas/obtener/:id', controller.obtenerBoletaPorId);
router.post('/boletas/modificar', controller.modificarBoleta);
router.post('/boletas/eliminar', controller.eliminarBoleta);

module.exports = router;
