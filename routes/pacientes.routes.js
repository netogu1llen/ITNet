const express = require('express');
const router = express.Router();
const pacientesController = require('../controllers/pacientes.controller');

router.get('/registrar', pacientesController.getRegistrarPaciente);
router.post('/registrar', pacientesController.postRegistrarPaciente);

router.get('/editar/:id', pacientesController.get_editar_paciente);
router.post('/editar/:id', pacientesController.post_editar_paciente);

module.exports = router;