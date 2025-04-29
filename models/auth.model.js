const db = require('../util/database');

class AuthModel {
  /**
   * Busca un usuario por su correo electrónico.
   * @param {string} email - Correo del usuario.
   * @returns {Promise<Object|null>} El usuario si existe, o null si no.
   */
  static async findByEmail(email) {
    try {
      // 1. Buscar usuario base
      const [rows] = await db.query(
        `SELECT 
          IDUsuario, 
          correo 
         FROM usuario 
         WHERE correo = ? 
         AND eliminado = 0 
         LIMIT 1`,
        [email.toLowerCase().trim()]
      );
  
      const user = rows[0];
      if (!user) return null;
  
      // 2. Obtener el rol del usuario
      const [rolesRows] = await db.query(
        `SELECT IDRol 
         FROM usuarioRol 
         WHERE IDUsuario = ?`,
        [user.IDUsuario]
      );
      const roles = rolesRows;
  
      // 3. Obtener todos los privilegios asociados a los roles del usuario
      const privilegios = [];
      for (const rol of roles) {
        const [permisosRows] = await db.query(
          `SELECT rp.IDPrivilegio 
           FROM rolPrivilegios rp
           WHERE rp.IDRol = ?`,
          [rol.IDRol]
        );
        privilegios.push(...permisosRows.map(p => p.IDPrivilegio));
      }
  
      return {
        ...user,
        IDRoles: roles.map(r => r.IDRol),
        IDPrivilegios: [...new Set(privilegios)] // Elimina duplicados
      };
  
    } catch (error) {
      console.error('Error detallado en findByEmail:', {
        inputEmail: email,
        error: error.message,
        sqlMessage: error.sqlMessage
      });
      throw new Error('Error técnico al buscar usuario');
    }
  }  
}

module.exports = AuthModel;
