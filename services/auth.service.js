const axios = require('axios');

exports.exchangeCodeForTokens = async (code) => {
    const response = await axios.post('https://oauth2.googleapis.com/token', {
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code',
    });

    return response.data; // Devuelve los tokens (access_token, refresh_token, etc.)
};

exports.getUserInfo = async (accessToken) => {
    const response = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    return response.data; // Devuelve la información del usuario (email, nombre, etc.)
};