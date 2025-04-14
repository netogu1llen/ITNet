const express = require('express');
const router = express.Router();

const rolController = require('../controllers/rol.controller');

// Ruta para obtener los datos de los usuarios (raíz del módulo)

router.get('/', rolController.get_roles);

router.post('/crearRol', rolController.post_crearRol);

module.exports = router;
