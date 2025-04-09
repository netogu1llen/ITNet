const express = require('express');
const router = express.Router();
const pacientesController = require('../controllers/pacientes.controller');

router.get('/registrar', pacientesController.getRegistrarPaciente);
router.post('/registrar', pacientesController.postRegistrarPaciente);

module.exports = router;