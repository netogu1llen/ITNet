const express = require('express');
const router = express.Router();
//PDF EN MINUSCULAS
const canDescargarPDF = require('../util/can-descargarPdf');
const canAgregarArchivosAdjuntos = require('../util/can-agregarArchivosAdjuntos');
const canGenerarPDF = require('../util/can-generarPdf');
const canConsultarPaciente = require('../util/can-consultarPaciente');
const canEliminarArchivosAdjunto = require('../util/can-eliminarArchivosAdjunto');
const canConsultarExpedientePsicologico = require('../util/can-consultarExpedientePsicologico');
const canRegistrarSeguimiento = require('../util/can-registrarSeguimiento');
const canEditarSeguimiento = require('../util/can-editarSeguimiento');
const canEliminarSeguimiento = require('../util/can-eliminarSeguimiento');

const psicologiaController = require('../controllers/psicologia.controller');

// Ruta para obtener todos los expedientes
router.get('/', canConsultarExpedientePsicologico,psicologiaController.getPacientesPsicologia);

// Ruta para obtener documentos por expediente
router.get('/documentos/:idExpediente', canConsultarExpedientePsicologico, canConsultarPaciente, psicologiaController.obtenerDocumentosPorExpediente);

// Añadir nueva ruta para la carga múltiple
router.post('/documentos/subir-multiple/:IDExpediente', canConsultarExpedientePsicologico, canConsultarPaciente, canAgregarArchivosAdjuntos, psicologiaController.subirMultiplesDocumentosMiddleware);

// Ruta para descargar un documento
router.get('/documentos/descargar/:id', canConsultarExpedientePsicologico, canConsultarPaciente, canGenerarPDF, canDescargarPDF, psicologiaController.descargarDocumento);

// Ruta para eliminar un documento
router.delete('/documentos/eliminar/:id', canConsultarExpedientePsicologico, canConsultarPaciente, canEliminarArchivosAdjunto, canEliminarSeguimiento, psicologiaController.eliminarDocumento);

// Ruta para mostrar un documento en el iframe (vista previa)
router.get('/documentos/ver/:id', canConsultarExpedientePsicologico, canConsultarPaciente, canGenerarPDF, psicologiaController.verDocumento);

router.get('/seguimientos/editar/:id', canConsultarExpedientePsicologico, canConsultarPaciente, canEditarSeguimiento, psicologiaController.get_editar_seguimiento);
router.post('/seguimientos/editar/:id', canConsultarExpedientePsicologico, canConsultarPaciente, psicologiaController.post_editar_seguimiento);

// Ruta para registrar seguimiento psicologico
router.get('/seguimientos/registrar/:id', canConsultarExpedientePsicologico, canConsultarPaciente, canRegistrarSeguimiento, psicologiaController.get_registrar_seguimiento);
router.post('/seguimientos/registrar/:id', canConsultarExpedientePsicologico, canConsultarPaciente, canRegistrarSeguimiento, psicologiaController.post_registrar_seguimiento);

module.exports = router;