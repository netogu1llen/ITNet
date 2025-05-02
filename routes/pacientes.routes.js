const express = require('express');
const router = express.Router();

const canConsultarPacientes = require('../util/can-consultarPacientes');
const canRegistrarPaciente = require('../util/can-registrarPaciente');
const canEditarPacientes = require('../util/can-editarPaciente');
const canEliminarPacientes = require('../util/can-eliminarPaciente');
const canDescargarPDF = require('../util/can-descargarPDF');
const canAgregarArchivosAdjuntos = require('../util/can-agregarArchivosAdjuntos');
const canGenerarPDF = require('../util/can-generarPDF');
const canConsultarPaciente = require('../util/can-consultarPaciente');
const canEliminarArchivosAdjunto = require('../util/can-eliminarArchivosAdjunto');

const pacientesController = require('../controllers/pacientes.controller');

router.get('/', canConsultarPacientes, pacientesController.getPacientes);

router.get('/registrar', canConsultarPacientes, canRegistrarPaciente, pacientesController.getRegistrarPaciente);
router.post('/registrar', canConsultarPacientes, canRegistrarPaciente, pacientesController.postRegistrarPaciente);

router.get('/editar/:id', canConsultarPacientes, canEditarPacientes, pacientesController.getEditarPaciente);
router.post('/editar/:id', canConsultarPacientes, canEditarPacientes, pacientesController.postEditarPaciente);

router.post('/eliminar/:id', canConsultarPacientes, canEliminarPacientes, pacientesController.postEliminarPaciente);

// Nuevas rutas para manejar expedientes y documentos
router.get('/expediente/:idExpediente', canConsultarPacientes, canConsultarPaciente, pacientesController.obtenerExpediente);
router.get('/documentos/:idExpediente', canConsultarPacientes, canConsultarPaciente, pacientesController.obtenerDocumentosPorExpediente);
// Para la subida múltiple de documentos
router.post('/documentos/subir-multiple/:IDExpediente', canConsultarPacientes, canConsultarPaciente, canAgregarArchivosAdjuntos, pacientesController.subirMultiplesDocumentos);
router.get('/documentos/descargar/:id', canConsultarPacientes, canConsultarPaciente, canGenerarPDF, canDescargarPDF, pacientesController.descargarDocumento);
router.delete('/documentos/eliminar/:id', canConsultarPacientes, canConsultarPaciente, canEliminarArchivosAdjunto, pacientesController.eliminarDocumento);
router.get('/documentos/ver/:id', canConsultarPacientes, canConsultarPaciente, canGenerarPDF, pacientesController.verDocumento);

module.exports = router;
