const express = require('express');
const { check, validationResult } = require('express-validator');

const router = express.Router();

// Procesar el login con validaciones
router.post('/login', [
    // Varificar que el correo tenga el formato
    check('email')
        .isEmail()
        .withMessage('Debe ingresar un email válido')
        .custom(email => {
            // Verificar que el correo pertenece a Google
            if (!email.endsWith('@gmail.com')) {
                throw new Error('Solo se permiten correos de Google (@gmail.com)');
            }
            return true;
        })
], (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errores: errors.array() });
    }

    res.json({ mensaje: 'Validación exitosa' });
});

module.exports = router;
