const express = require('express');
const router = express.Router();

const canConsultarPacientes = require('../util/can-consultarPacientes');
const canRegistrarPacientes = require('../util/can-registrarPaciente');
const canEditarPacientes = require('../util/can-editarPaciente');
const canEliminarPacientes = require('../util/can-eliminarPaciente');

const pacientesController = require('../controllers/pacientes.controller');

router.get('/', pacientesController.getPacientes);

router.get('/registrar', pacientesController.getRegistrarPaciente);
router.post('/registrar', pacientesController.postRegistrarPaciente);

router.get('/editar/:id', pacientesController.getEditarPaciente);
router.post('/editar/:id', pacientesController.postEditarPaciente);

router.post('/eliminar/:id', pacientesController.postEliminarPaciente);

module.exports = router;
