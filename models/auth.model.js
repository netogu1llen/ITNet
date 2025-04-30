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
        `SELECT r.IDRol, r.Tipo 
         FROM usuarioRol ur
         JOIN rol r ON ur.IDRol = r.IDRol
         WHERE ur.IDUsuario = ?`,
        [user.IDUsuario]
      );
      
      const roles = rolesRows;
  
      // 3. Obtener todos los privilegios asociados a los roles del usuario
      const privilegios = [];
      for (const rol of roles) {
        const [permisosRows] = await db.query(
          `SELECT p.Actividad 
           FROM rolPrivilegios rp
           JOIN privilegios p ON rp.IDPrivilegio = p.IDPrivilegio
           WHERE rp.IDRol = (
             SELECT IDRol FROM rol WHERE Tipo = ?
           )`,
          [rol.Tipo]
        );
        privilegios.push(...permisosRows.map(p => p.Actividad));
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
