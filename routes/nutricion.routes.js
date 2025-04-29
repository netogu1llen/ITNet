const express = require('express');
const router = express.Router();

const canVerExpediente = require('../util/can-verExpediente');
const canConsultarExpedienteNutricional = require('../util/can-consultarExpedienteNutricional');
const canGenerarPdf = require('../util/can-generarPdf');
const canDescargarPdf = require('../util/can-descargarPdf');
const canRegistarHistorialClinicoVer1 = require('../util/can-registrarHistorialClinicoVer1');
const canEditarHistorialClinicoVer1 = require('../util/can-editarHistorialClinicoVer1');
const canEliminarHistorialClinicoVer1 = require('../util/can-eliminarHistorialClinicoVer1');
const canRegistarHistorialClinicoVer2 = require('../util/can-registrarHistorialClinicoVer2');
const canEditarHistorialClinicoVer2 = require('../util/can-editarHistorialClinicoVer2');
const canEliminarHistorialClinicoVer2 = require('../util/can-eliminarHistorialClinicoVer2');

const nutricionController = require('../controllers/nutricion.controller');

// Ruta para obtener la vista y los historiales clínicos
router.get('/', nutricionController.obtenerHistoriales);

// Eliminar un historial
router.post('/eliminar/:id', nutricionController.eliminarHistorial);

// Expediente nutricional (ahora recibe el ID como parámetro de consulta)
router.get('/documentos/:id', nutricionController.getExpedienteNutricion);

// Descargar un documento
router.get('/documentos/descargar/:id', nutricionController.descargarDocumento);

// Ruta para mostrar un documento en el iframe (vista previa)
router.get('/documentos/ver/:id', nutricionController.verDocumento);

// Ruta para eliminar documento
router.delete('/documentos/eliminar/:id', nutricionController.eliminarDocumento);

// Ruta para subir un documento
router.post('/documentos/subir/:IDExpediente', nutricionController.subirDocumentoMiddleware);

// Reorganizar las rutas de historia clínica (el orden es importante)
router.get('/historiaClinica/create/:id', nutricionController.createHistoriaClinicaV1);
router.get('/historiaClinica/edit/:id', nutricionController.editHistoriaClinicaV1);
router.get('/historiaClinica/:id', nutricionController.checkAndRedirectHistoriaClinica);
router.get('/historiaClinicaV2/:id', nutricionController.renderHistoriaClinicaV2);

router.post('/historiaClinica/guardarHistoriaClinicaV1', nutricionController.guardarHistoriaClinicaV1);
router.post('/historiaClinica/actualizarHistoriaClinicaV1', nutricionController.actualizarHistoriaClinicaV1);
router.post('/historiaClinica/guardarHistoriaClinicaV2', canRegistarHistorialClinicoVer2, nutricionController.guardarHistoriaClinicaV2);
router.post('/historiaClinica/actualizarHistoriaClinicaV2', canEditarHistorialClinicoVer2, nutricionController.actualizarHistoriaClinicaV2);

module.exports = router;