const authService = require('../services/authService');

exports.googleCallback = async (req, res) => {
    const code = req.query.code; // Código de autorización

    try {
        // Intercambia el código por un token de acceso
        const tokens = await authService.exchangeCodeForTokens(code);

        // Obtén la información del usuario
        const userInfo = await authService.getUserInfo(tokens.access_token);

        // Guarda la información del usuario en la base de datos o inicia sesión
        // ...

        res.redirect('/'); // Redirige a ruta raíz
    } catch (error) {
        console.error('Error en el callback de Google:', error);
        res.status(500).send('Error en la autenticación');
    }
};