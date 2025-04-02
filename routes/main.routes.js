const express = require('express');
const router = express.Router();

// Importar controladores
const mainController = require('../controllers/main.controller');

// Importar rutas de S3
const s3Routes = require('./s3services.routes');



router.get('/login', (req, res) => {
    res.render('login')
});
// Rutas principales
router.get('/', mainController.getHome);
router.get('/clinica', mainController.getClinicaV2);
router.get('/pacientes', mainController.getPacientes);
router.get('/trabajadores', mainController.getTrabajadores);


// Usar las rutas de S3 con un prefijo "/api"
router.use('/api', s3Routes);

module.exports = router;