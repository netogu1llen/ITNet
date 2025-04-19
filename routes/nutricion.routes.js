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

router.get('/historiaClinica/:id', nutricionController.renderHistoriaClinica);
router.post('/historiaClinica/:id', nutricionController.guardarHistoriaClinica);

router.post('/historiaClinica/guardarHistoriaClinicaV1', nutricionController.guardarHistoriaClinicaV1);



module.exports = router;
