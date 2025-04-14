const axios = require('axios');
const userService = require('./user.service'); // Servicio separado para usuarios
const { generateToken } = require('../util/jwt');
const user = await userService.findByEmail(googleUser.email);

class AuthService {
  constructor() {
    this.googleConfig = {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      redirectUri: process.env.GOOGLE_REDIRECT_URI
    };
  }

  generateGoogleAuthUrl() {
    const { clientId, redirectUri } = this.googleConfig;
    return `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=code` +
      `&scope=openid%20email%20profile` +
      `&access_type=offline` +
      `&prompt=consent`;
  }

  async authenticateWithGoogle(code) {
    try {
      const tokens = await this.exchangeCodeForTokens(code);
      const userInfo = await this.getUserInfo(tokens.access_token);
      
      return {
        ...userInfo,
        refreshToken: tokens.refresh_token
      };
    } catch (error) {
      throw new Error(`Google authentication failed: ${error.message}`);
    }
  }

  async exchangeCodeForTokens(code) {
    try {
      const { data } = await axios.post('https://oauth2.googleapis.com/token', {
        code,
        client_id: this.googleConfig.clientId,
        client_secret: this.googleConfig.clientSecret,
        redirect_uri: this.googleConfig.redirectUri,
        grant_type: 'authorization_code',
      });
      return data;
    } catch (error) {
      throw new Error(`Error exchanging code: ${error.response?.data?.error || error.message}`);
    }
  }

  async getUserInfo(accessToken) {
    try {
      const { data } = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      return data;
    } catch (error) {
      throw new Error(`Error getting user info: ${error.response?.data?.error || error.message}`);
    }
  }

  async handleGoogleUser(googleUser) {
    const user = await userService.findByEmail(googleUser.email);
  
    if (!user) {
      throw new Error('Este correo no está registrado en el sistema.');
    }
  
    return generateToken({
      userId: user.id,
      email: user.email
    });
  }
  
}

module.exports = new AuthService();