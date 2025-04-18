const db = require('../util/database');

class AuthModel {
  /**
   * Busca un usuario por su correo electrónico.
   * @param {string} email - Correo del usuario.
   * @returns {Promise<Object|null>} El usuario si existe, o null si no.
   */
  static async findByEmail(email) {
    const [result] = await db.query('SELECT * FROM usuario WHERE correo = ? AND eliminado = FALSE LIMIT 1', [email]);
    return result.length > 0 ? result[0] : null;
  }
}

module.exports = AuthModel;
