const express = require('express');
const router = express.Router();
const pacientesController = require('../controllers/pacientes.controller');

router.get('/', pacientesController.getPacientes);

router.get('/registrar', pacientesController.getRegistrarPaciente);
router.post('/registrar', pacientesController.postRegistrarPaciente);

router.get('/editar/:id', pacientesController.getEditarPaciente);
router.post('/editar/:id', pacientesController.postEditarPaciente);

router.post('/eliminar/:id', pacientesController.postEliminarPaciente);

module.exports = router;