const express = require('express');
const router = express.Router();
const pacientesController = require('../controllers/pacientes.controller');

router.get('/registrar', pacientesController.get_registrar_paciente);
router.post('/registrar', pacientesController.post_registrar_paciente);

module.exports = router;