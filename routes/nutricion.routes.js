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

// Ruta para mostrar un historial nutricional V2
router.get('/historial-nutricional-v2', nutricionController.getHistorialNutricionalV2);

// Ruta para eliminar documento
router.delete('/documentos/eliminar/:id', nutricionController.eliminarDocumento);

// Ruta para subir un documento
router.post('/documentos/subir/:IDExpediente', nutricionController.subirDocumentoMiddleware);
router.get('/documentos/:id', nutricionController.getExpedienteNutricion);

router.get('/historiaClinica/:id', nutricionController.renderHistoriaClinica);

router.post('/historiaClinica/guardarHistoriaClinicaV1', nutricionController.guardarHistoriaClinicaV1);

module.exports = router;