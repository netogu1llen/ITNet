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

// Nuevas rutas para manejar expedientes y documentos
router.get('/expediente/:idExpediente', pacientesController.obtenerExpediente);
router.get('/documentos/:idExpediente', pacientesController.obtenerDocumentosPorExpediente);
// Para la subida múltiple de documentos
router.post('/documentos/subir-multiple/:IDExpediente', pacientesController.subirMultiplesDocumentos);
router.get('/documentos/descargar/:id', pacientesController.descargarDocumento);
router.delete('/documentos/eliminar/:id', pacientesController.eliminarDocumento);
router.get('/documentos/ver/:id', pacientesController.verDocumento);

module.exports = router;
