const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuarios.controller');

const canConsultarUsuarios = require('../util/can-consultarUsuarios');
const canRegistrarUsuario = require('../util/can-registrarUsuario');
const canEditarUsuario = require('../util/can-editarUsuario');
const canEliminarUsuario = require('../util/can-eliminarUsuario');

// Ruta para obtener los datos de los usuarios (raíz del módulo)
router.get('/', canConsultarUsuarios, usuariosController.obtenerUsuarios);

// Ruta para registrar un nuevo usuario (procesar datos enviados desde el modal)
router.post('/registrar', canConsultarUsuarios, canRegistrarUsuario,usuariosController.registrarUsuario);

// Ruta para renderizar la vista de registro de usuario (modal)
router.get('/modificar/:id', canConsultarUsuarios, canEditarUsuario, usuariosController.obtenerUsuarioPorId);

// Ruta para modificar un usuario existente (requiere ID dinámico)
router.post('/modificar/:id', canConsultarUsuarios, canEditarUsuario, usuariosController.modificarUsuario);

// Ruta para eliminar un usuario (requiere ID dinámico)
router.post('/eliminar/:id', canConsultarUsuarios, canEliminarUsuario, usuariosController.eliminarUsuario);

router.post('/verificar-correo', canConsultarUsuarios, usuariosController.verificarCorreoExistente);

// Ruta para cambiar el rol de un usuario
router.post('/cambiar-rol/:id', canConsultarUsuarios, usuariosController.cambiarRolUsuario);

module.exports = router;
