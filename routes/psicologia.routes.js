const express = require('express');
const router = express.Router();
const psicologiaController = require('../controllers/psicologia.controller');

// Ruta para obtener todos los expedientes
router.get('/', psicologiaController.getPacientesPsicologia);

// Ruta para obtener documentos por expediente
router.get('/documentos/:idExpediente', psicologiaController.obtenerDocumentosPorExpediente);

// Ruta para subir un documento a un expediente específico
// Ahora usa el middleware combinado del controlador
router.post('/documentos/subir/:IDExpediente', psicologiaController.subirDocumentoMiddleware);

// Ruta para descargar un documento
router.get('/documentos/descargar/:id', psicologiaController.descargarDocumento);

// Ruta para eliminar un documento
router.delete('/documentos/eliminar/:id', psicologiaController.eliminarDocumento);

// Ruta para mostrar un documento en el iframe (vista previa)
router.get('/documentos/ver/:id', psicologiaController.verDocumento);

router.get('/seguimientos/editar/:id', psicologiaController.get_editar_seguimiento);
router.post('/seguimientos/editar/:id', psicologiaController.post_editar_seguimiento);

// Ruta para registrar seguimiento psicologico
router.get('/seguimientos/registrar/:id', psicologiaController.get_registrar_seguimiento);
router.post('/seguimientos/registrar/:id', psicologiaController.post_registrar_seguimiento);

module.exports = router;