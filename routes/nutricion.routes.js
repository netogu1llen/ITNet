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

const controller = require('../controllers/nutricion.controller');

router.get('/', controller.renderNutricionView);
router.get('/data', controller.getNutricionData);

// Ruta para la vista de planes alimenticios
router.get('/planes-alimenticios', controller.renderPlanesAlimenticios);
// Ruta para obtener los datos de planes alimenticios
router.get('/planes-alimenticios/data', controller.getPlanesAlimenticiosData);

module.exports = router;
