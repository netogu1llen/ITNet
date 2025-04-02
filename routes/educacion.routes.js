const express = require('express');
const router = express.Router();
const controller = require('../controllers/educacion.controller');

router.get('/', controller.renderEducacionView);
router.get('/data', controller.getEducacionData);


module.exports = router;
