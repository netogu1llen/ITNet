const express = require('express');
const multer = require('multer');
const path = require('path'); // Añadido path que estaba faltando
const router = express.Router();
const psicologiaController = require('../controllers/psicologia.controller');

// Ruta para obtener documentos por expediente
router.get('/documentos/:idExpediente', psicologiaController.obtenerDocumentosPorExpediente);

// Configuración de Multer para guardar archivos localmente
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Carpeta donde se guardarán los archivos
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname)); // Nombre único para evitar conflictos
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true); // Aceptar solo archivos PDF
        } else {
            cb(new Error('Solo se permiten archivos PDF.'));
        }
    }
});

// Ruta para subir un documento a un expediente específico
router.post('/documentos/subir/:IDExpediente', upload.single('archivoDocumento'), psicologiaController.subirDocumento);

// Ruta para descargar un documento
router.get('/documentos/descargar/:id', psicologiaController.descargarDocumento);

// Ruta para eliminar un documento
router.delete('/documentos/eliminar/:id', psicologiaController.eliminarDocumento);

// Ruta para descargar un documento
router.get('/documentos/descargar/:id', psicologiaController.descargarDocumento);

// Ruta para mostrar un documento en el iframe (vista previa)
router.get('/documentos/ver/:id', psicologiaController.verDocumento);

module.exports = router;