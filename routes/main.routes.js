const express = require('express');
const router = express.Router();

// Importar controladores
const mainController = require('../controllers/main.controller');


// Importar rutas de S3
const s3Routes = require('./s3services.routes');
const nutricionRoutes = require('./nutricion.routes');

// Rutas principales
router.get('/', mainController.getHome);
router.use('/nutricion', nutricionRoutes);
// Usar las rutas de S3 con un prefijo "/api"
router.use('/api', s3Routes);

module.exports = router;