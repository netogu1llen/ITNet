const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuarios.controller');

// Ruta para obtener los datos de los usuarios (raíz del módulo)
router.get('/', usuariosController.obtenerUsuarios);

// Ruta para registrar un nuevo usuario (procesar datos enviados desde el modal)
router.post('/registrar', usuariosController.registrarUsuario);

// Ruta para renderizar la vista de registro de usuario (modal)
router.get('/modificar/:id', usuariosController.obtenerUsuarioPorId);

// Ruta para modificar un usuario existente (requiere ID dinámico)
router.post('/modificar/:id', usuariosController.modificarUsuario);

// Ruta para eliminar un usuario (requiere ID dinámico)
router.post('/eliminar/:id', usuariosController.eliminarUsuario);

module.exports = router;