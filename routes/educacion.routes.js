const express = require('express');
const router = express.Router();

// Permisos
const canConsultarPacientes = require('../util/can-consultarPacientes');
const canRegistrarBoleta = require('../util/can-registrarBoleta');
const canEditarBoleta = require('../util/can-editarBoleta');
const canEliminarBoleta = require('../util/can-eliminarBoleta');
const canConsultarBoletas = require('../util/can-consultarBoletas');
const canConsultarMaterias = require('../util/can-consultarMaterias');
const canRegistrarMateria = require('../util/can-registrarMateria');
const canEditarMateria = require('../util/can-editarMateria');
const canEliminarMateria = require('../util/can-eliminarMateria');
const canEditarCalificacion = require('../util/can-editarCalificacion');

// Controlador
const controller = require('../controllers/educacion.controller');

/**
 * ========== VISTA PRINCIPAL ==========
 */
router.get('/', canConsultarBoletas,controller.renderEducacionView);
router.get('/alumnos/data', canConsultarBoletas, canConsultarPacientes, controller.getAlumnosInfo);

/**
 * ========== MATERIAS ==========
 */
router.get('/materias', canConsultarBoletas, canConsultarMaterias, controller.renderMaterias);
router.get('/materias/lista', canConsultarBoletas, canConsultarMaterias, controller.getMateriasList);
router.get('/materias/:id', canConsultarBoletas, canConsultarMaterias, controller.getMateriaById);
router.get('/materias/obtener/:id', canConsultarBoletas, canRegistrarMateria, controller.obtenerMateria);
router.post('/materias/registrar', canConsultarBoletas, canRegistrarMateria, canRegistrarMateria, controller.insertMateria);
router.post('/materias/modificar', canConsultarBoletas, canRegistrarMateria, canEditarMateria, controller.updateMateria);
router.post('/materias/eliminar', canConsultarBoletas, canRegistrarMateria, canEliminarMateria, controller.deleteMateria);

/**
 * ========== BOLETAS ==========
 */
router.get('/boletas', canConsultarBoletas, canConsultarPacientes, controller.renderBoletasView);
router.post('/boletas/registrar', canConsultarBoletas, canConsultarPacientes, canRegistrarBoleta, canEditarCalificacion, controller.registrarBoleta);
router.get('/boletas/obtener/:id', canConsultarBoletas, canConsultarPacientes, controller.obtenerBoletaPorId);
router.post('/boletas/modificar', canConsultarBoletas, canConsultarPacientes, canEditarBoleta, canEditarCalificacion, controller.modificarBoleta);
router.post('/boletas/eliminar', canConsultarBoletas, canConsultarPacientes, canEliminarBoleta, controller.eliminarBoleta);

module.exports = router;
