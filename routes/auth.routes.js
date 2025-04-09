const express = require('express');
const authController = require('../controllers/auth.controller');

const router = express.Router();

// Ruta para el callback de Google
router.get('/google/callback', authController.googleCallback);

module.exports = router;