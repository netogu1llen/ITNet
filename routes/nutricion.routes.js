const express = require('express');
const router = express.Router();

const canDescargarPDF = require('../util/can-descargarPDF');
const canAgregarArchivosAdjuntos = require('../util/can-agregarArchivosAdjuntos');
const canGenerarPDF = require('../util/can-generarPDF');
const canConsultarPaciente = require('../util/can-consultarPaciente');
const canEliminarArchivosAdjunto = require('../util/can-eliminarArchivosAdjunto');
const canConsultarExpedienteNutricional = require('../util/can-consultarExpedienteNutricional');
const canRegistarHistorialClinicoVer1 = require('../util/can-registrarHistorialClinicoVer1');
const canEditarHistorialClinicoVer1 = require('../util/can-editarHistorialClinicoVer1');
const canRegistarHistorialClinicoVer2 = require('../util/can-registrarHistorialClinicoVer2');
const canEditarHistorialClinicoVer2 = require('../util/can-editarHistorialClinicoVer2');
const canEliminarHistorialClinicoVer2 = require('../util/can-eliminarHistorialClinicoVer2');

// Importar el controlador de nutrición
const nutricionController = require('../controllers/nutricion.controller');
// Ruta para obtener la vista y los historiales clínicos
router.get('/', canConsultarExpedienteNutricional, nutricionController.obtenerHistoriales);

// Eliminar un historial
router.post('/eliminar/:id', canConsultarExpedienteNutricional, canConsultarPaciente, canEliminarArchivosAdjunto, canEliminarHistorialClinicoVer2, nutricionController.eliminarHistorial);

// Expediente nutricional (ahora recibe el ID como parámetro de consulta)
router.get('/documentos/:id', canConsultarExpedienteNutricional, canConsultarPaciente, nutricionController.getExpedienteNutricion);

// Descargar un documento
router.get('/documentos/descargar/:id', canConsultarExpedienteNutricional, canConsultarPaciente, canGenerarPDF, canDescargarPDF, nutricionController.descargarDocumento);

// Ruta para mostrar un documento en el iframe (vista previa)
router.get('/documentos/ver/:id', canConsultarExpedienteNutricional, canConsultarPaciente, canGenerarPDF, nutricionController.verDocumento);

// Ruta para eliminar documento
router.delete('/documentos/eliminar/:id', canConsultarExpedienteNutricional, canConsultarPaciente, canEliminarArchivosAdjunto, canEliminarHistorialClinicoVer2, nutricionController.eliminarDocumento);

// Ruta para subir múltiples documentos
router.post('/documentos/subir-multiple/:IDExpediente', canConsultarExpedienteNutricional, canConsultarPaciente,canAgregarArchivosAdjuntos, nutricionController.subirMultiplesDocumentosMiddleware);

// Reorganizar las rutas de historia clínica (el orden es importante)
router.get('/historiaClinica/create/:id', canConsultarExpedienteNutricional, canConsultarPaciente, canRegistarHistorialClinicoVer1, canRegistarHistorialClinicoVer2, nutricionController.createHistoriaClinicaV1);
router.get('/historiaClinica/edit/:id', canConsultarExpedienteNutricional, canConsultarPaciente, canEditarHistorialClinicoVer1, canEditarHistorialClinicoVer2, nutricionController.editHistoriaClinicaV1);
router.get('/historiaClinica/:id', canConsultarExpedienteNutricional, canConsultarPaciente, canRegistarHistorialClinicoVer1, nutricionController.checkAndRedirectHistoriaClinica);
router.get('/historiaClinicaV2/:id', canConsultarExpedienteNutricional, canConsultarPaciente, canRegistarHistorialClinicoVer2, nutricionController.renderHistoriaClinicaV2);

router.post('/historiaClinica/guardarHistoriaClinicaV1', canConsultarExpedienteNutricional, canConsultarPaciente, canRegistarHistorialClinicoVer1, nutricionController.guardarHistoriaClinicaV1);
router.post('/historiaClinica/actualizarHistoriaClinicaV1', canConsultarExpedienteNutricional, canConsultarPaciente, canEditarHistorialClinicoVer1, nutricionController.actualizarHistoriaClinicaV1);
router.post('/historiaClinica/guardarHistoriaClinicaV2', canConsultarExpedienteNutricional, canConsultarPaciente, canRegistarHistorialClinicoVer2, nutricionController.guardarHistoriaClinicaV2);
router.post('/historiaClinica/actualizarHistoriaClinicaV2', canConsultarExpedienteNutricional, canConsultarPaciente, canEditarHistorialClinicoVer2, nutricionController.actualizarHistoriaClinicaV2);

module.exports = router;