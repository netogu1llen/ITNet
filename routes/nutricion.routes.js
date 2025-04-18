const express = require('express');
const router = express.Router();
const nutricionController = require('../controllers/nutricion.controller');

// Ruta para obtener la vista y los historiales clínicos
router.get('/', nutricionController.obtenerHistoriales);

// Obtener un historial por ID para modificar
router.get('/modificar/:id', nutricionController.obtenerHistorialPorId);

// Modificar un historial
router.post('/modificar/:id', nutricionController.modificarHistorial);



module.exports = router;
