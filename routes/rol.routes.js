const express = require('express');
const router = express.Router();

const canConsultarRoles =  require('../util/can-consultarRoles');
const canCrearRol = require('../util/can-crearRol');
const canEditarRol = require('../util/can-editarRol');
const canEliminarRol = require('../util/can-eliminarRol');

const rolController = require('../controllers/rol.controller');

// Ruta para obtener los datos de los usuarios (raíz del módulo)

router.get('/', canConsultarRoles, rolController.get_roles);

router.post('/crearRol', canConsultarRoles, canCrearRol, rolController.post_crearRol);

router.get('/editarRol/:id', canConsultarRoles, canEditarRol, rolController.get_rolPorId);

router.post('/editarRol/:id', canConsultarRoles, canEditarRol, rolController.post_editarRol);

router.post('/eliminarRol/:id', canConsultarRoles, canEliminarRol,rolController.post_eliminarRol);

module.exports = router;
