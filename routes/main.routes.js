const express = require('express');
const router = express.Router();

// Importar controladores
const mainController = require('../controllers/main.controller');

// Importar rutas de S3
const s3Routes = require('./s3services.routes');

// Rutas principales
<<<<<<< HEAD
router.get('/', mainController.getClinicaV2);
=======
router.get('/', mainController.getHome);
router.get('/', mainController.getPacientes);
router.get('/', mainController.getTrabajadores);
>>>>>>> 98e914f9713ca478527d1c349892acfb39431434

// Usar las rutas de S3 con un prefijo "/api"
router.use('/api', s3Routes);

module.exports = router;