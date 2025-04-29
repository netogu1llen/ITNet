/**
 * Servicio para manejar la autenticación OAuth 2.0 con Google
 * 
 * Este servicio proporciona:
 * - Generación de URLs de autenticación
 * - Intercambio de códigos por tokens
 * - Obtención de información de usuario
 * - Manejo de usuarios registrados
 * 
 * Utiliza Axios para llamadas HTTP y un servicio de usuarios externo.
 */
const axios = require('axios');
const userService = require('../models/auth.model'); // Servicio separado para usuarios
const { generateUserToken } = require('../util/jwt'); // Utilidad para JWT

class AuthService {
  constructor() {
    // Configuración OAuth obtenida de variables de entorno
    this.googleConfig = {
      clientId: process.env.GOOGLE_CLIENT_ID,       // ID de cliente de Google Cloud
      clientSecret: process.env.GOOGLE_CLIENT_SECRET, // Secreto de cliente
      redirectUri: process.env.GOOGLE_REDIRECT_URI   // URI de redirección registrada
    };
  }

  /**
   * Genera la URL para autenticación con Google OAuth 2.0
   * @returns {string} URL completa para iniciar el flujo OAuth
   */
  generateGoogleAuthUrl() {
    const { clientId, redirectUri } = this.googleConfig;
    return `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` + // URL encode para seguridad
      `&response_type=code` + // Flujo Authorization Code
      `&scope=openid%20email%20profile` + // Scopes solicitados
      `&access_type=offline` + // Para obtener refresh token
      `&prompt=consent`; // Fuerza consentimiento cada vez
  }

  /**
   * Autentica un usuario mediante código de autorización de Google
   * @param {string} code - Código de autorización obtenido del callback
   * @returns {Promise<Object>} Objeto con información del usuario y refresh token
   * @throws {Error} Si falla la autenticación
   */
  async authenticateWithGoogle(code) {
    try {
      // 1. Intercambia código por tokens de acceso
      const tokens = await this.exchangeCodeForTokens(code);
      
      // 2. Obtiene información del usuario
      const userInfo = await this.getUserInfo(tokens.access_token);
      
      return {
        ...userInfo, // Datos básicos del usuario
        refreshToken: tokens.refresh_token // Token de refresco
      };
    } catch (error) {
      // Error detallado pero seguro para el cliente
      throw new Error(`Google authentication failed: ${error.message}`);
    }
  }

  /**
   * Intercambia código de autorización por tokens de acceso
   * @param {string} code - Código de autorización
   * @returns {Promise<Object>} Tokens de acceso, refresco y ID
   * @throws {Error} Si falla el intercambio
   */
  async exchangeCodeForTokens(code) {
    try {
      const { data } = await axios.post('https://oauth2.googleapis.com/token', {
        code,
        client_id: this.googleConfig.clientId,
        client_secret: this.googleConfig.clientSecret,
        redirect_uri: this.googleConfig.redirectUri,
        grant_type: 'authorization_code', // Tipo de concesión OAuth
      });
      return data; // { access_token, refresh_token, expires_in, id_token }
    } catch (error) {
      // Proporciona detalles del error de Google si están disponibles
      throw new Error(`Error exchanging code: ${error.response?.data?.error || error.message}`);
    }
  }

  /**
   * Obtiene información básica del usuario desde Google
   * @param {string} accessToken - Token de acceso válido
   * @returns {Promise<Object>} Información del perfil de usuario
   * @throws {Error} Si falla la solicitud
   */
  async getUserInfo(accessToken) {
    try {
      const { data } = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` } // Auth con token
      });
      return data; // { sub, name, given_name, picture, email, etc }
    } catch (error) {
      throw new Error(`Error getting user info: ${error.response?.data?.error || error.message}`);
    }
  }

  /**
   * Maneja un usuario autenticado con Google y genera JWT
   * @param {Object} googleUser - Usuario obtenido de Google
   * @returns {Promise<string>} Token JWT generado
   * @throws {Error} Si el usuario no está registrado
   */
  async handleGoogleUser(googleUser) {
    // Busca usuario por email en la base de datos
    try {
      const user = await userService.findByEmail(googleUser.email);
      
      if (!user) {
        throw new Error('Usuario no registrado');
      }
  
      const tokenPayload = {
        userId: user.IDUsuario,
        email: user.correo,
        roles: user.IDRoles || [],
        privileges: user.IDPrivilegios || []
      };
  
      // Verificación de datos incluidos en el token
      console.log('Payload del Token JWT:', {
        datosUsuario: {
          id: tokenPayload.userId,
          email: tokenPayload.email
        },
        autorizacion: {
          roles: tokenPayload.roles,
          privilegios: tokenPayload.privileges
        },
        timestamp: new Date().toISOString()
      });
  
      return generateUserToken(tokenPayload);
  
    } catch (error) {
      console.error('Error en handleGoogleUser:', error);
      throw error;
    }
  }
}

// Exporta una instancia singleton del servicio
module.exports = new AuthService();