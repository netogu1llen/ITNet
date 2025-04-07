const express = require('express');
const router = express.Router();
const pacientesController = require('../controllers/pacientes.controller');

router.get('/', pacientesController.get_pacientes);

router.get('/registrar', pacientesController.get_registrar_paciente);
router.post('/registrar', pacientesController.post_registrar_paciente);

router.get('/editar/:id', pacientesController.get_editar_paciente);
router.post('/editar/:id', pacientesController.post_editar_paciente);

router.post('/eliminar/:id', pacientesController.post_eliminar_paciente);

module.exports = router;