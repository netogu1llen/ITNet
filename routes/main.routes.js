const express = require('express');
const router = express.Router();

// Importar controladores
const mainController = require('../controllers/main.controller');

// Importar rutas de S3
const s3Routes = require('./pdf.routes');

// Ruta para mostrar el login
router.get('/login', (req, res) => {
    res.render('login', {
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID  // Pasar la variable GOOGLE_CLIENT_ID desde .env
    });
});

// Rutas principales
router.get('/', mainController.getHome);
router.get('/historiaClinica', mainController.getHistoriaClinica);
router.get('/clinica', mainController.getClinicaV2);
router.get('/pacientes', mainController.getPacientes);
router.get('/trabajadores', mainController.getTrabajadores);


// Usar las rutas de S3 con un prefijo "/api"
router.use('/api', s3Routes);

module.exports = router;
