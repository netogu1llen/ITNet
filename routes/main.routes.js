const express = require('express');
const router = express.Router();

// Importar controladores
const mainController = require('../controllers/main.controller');

// Ruta para mostrar el login
router.get('/login', (req, res) => {
    res.render('login', {
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID  // Pasar la variable GOOGLE_CLIENT_ID desde .env
    });
});

// Rutas principales
router.get('/', mainController.getHome);


module.exports = router;
