const express = require('express');
const router = express.Router();

const canConsultarRoles =  require('../util/can-consultarRoles');
const canCrearRol = require('../util/can-crearRol');
const canEditarRol = require('../util/can-editarRol');
const canEliminarRol = require('../util/can-eliminarRol');

const rolController = require('../controllers/rol.controller');

// Ruta para obtener los datos de los usuarios (raíz del módulo)

router.get('/', rolController.get_roles);

router.post('/crearRol', rolController.post_crearRol);

router.get('/editarRol/:id', rolController.get_rolPorId);

router.post('/editarRol/:id', rolController.post_editarRol);

router.post('/eliminarRol/:id', rolController.post_eliminarRol);

module.exports = router;
