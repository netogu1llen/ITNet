const db = require('../util/database');

class Usuario {
    // Obtener todos los usuarios (excluyendo los eliminados)
    static async obtenerTodos() {
        try {
            const [results] = await db.execute(`
                SELECT u.IDUsuario, u.nombres, u.apellidoP, u.apellidoM, u.correo, 
                       u.fechaNacimiento, 
                       r.Tipo AS rol, r.IDRol as idRol
                FROM usuario u
                LEFT JOIN usuarioRol ur ON u.IDUsuario = ur.IDUsuario
                LEFT JOIN rol r ON ur.IDRol = r.IDRol
                WHERE u.eliminado IS NULL OR u.eliminado = 0
            `);
        
            return results;
        } catch (error) {
            console.error("Error en obtenerTodos:", error);
            throw error;
        }
    }

    // Registrar un nuevo usuario
    static async registrar({ nombres, apellidoP, apellidoM, correo, fechaNacimiento }) {
        try {
            // Convertir formato de fecha si es necesario (del formato YYYY-MM-DD del input date al formato MySQL)
            const [result] = await db.execute(`
                INSERT INTO usuario (nombres, apellidoP, apellidoM, correo, fechaNacimiento)
                VALUES (?, ?, ?, ?, ?)
            `, [nombres, apellidoP, apellidoM, correo, fechaNacimiento]);
            return result;
        } catch (error) {
            throw error;
        }
    }

    // Obtener un usuario por ID (para el modal de modificación)
    static async obtenerPorId(idUsuario) {
        try {
            const [results] = await db.execute(`
                SELECT u.IDUsuario, u.nombres, u.apellidoP, u.apellidoM, u.correo, 
                      u.fechaNacimiento, r.IDRol as idRol
                FROM usuario u
                LEFT JOIN usuarioRol ur ON u.IDUsuario = ur.IDUsuario
                LEFT JOIN rol r ON ur.IDRol = r.IDRol
                WHERE u.IDUsuario = ?
            `, [idUsuario]);
            return results[0]; // Devuelve el primer resultado
        } catch (error) {
            throw error;
        }
    }

    // Modificar un usuario existente
    static async modificar(idUsuario, { nombres, apellidoP, apellidoM, correo, fechaNacimiento }) {
        try {
            const [result] = await db.execute(`
                UPDATE usuario
                SET nombres = ?, apellidoP = ?, apellidoM = ?, correo = ?, fechaNacimiento = ?
                WHERE IDUsuario = ?
            `, [nombres, apellidoP, apellidoM, correo, fechaNacimiento, idUsuario]);
            return result;
        } catch (error) {
            throw error;
        }
    }

    // Eliminar un usuario (borrado lógico)
    static async eliminar(idUsuario) {
        try {
            const [result] = await db.execute(`
                UPDATE usuario
                SET eliminado = 1
                WHERE IDUsuario = ?
            `, [idUsuario]);
            return result;
        } catch (error) {
            throw error;
        }
    }

    // Verificar si un correo ya existe en la base de datos
    static async verificarCorreoExistente(correo, idUsuario = null) {
        try {
            let query = 'SELECT COUNT(*) as count FROM usuario WHERE correo = ?';
            let params = [correo];
            
            // Si se proporciona un ID de usuario, excluirlo de la verificación (para modificaciones)
            if (idUsuario) {
                query += ' AND IDUsuario != ?';
                params.push(idUsuario);
            }
            
            const [results] = await db.execute(query, params);
            return results[0].count > 0;
        } catch (error) {
            console.error("Error al verificar correo existente:", error);
            throw error;
        }
    }


    // Obtener todos los roles disponibles (no eliminados)
    static async obtenerRoles() {
        try {
            const [results] = await db.execute(`
                SELECT IDRol, Tipo 
                FROM rol
                WHERE eliminado IS NULL OR eliminado = 0
                ORDER BY Tipo ASC
            `);
            return results;
        } catch (error) {
            console.error("Error al obtener roles:", error);
            throw error;
        }
    }

    // Asignar rol a un usuario
    static async asignarRol(idUsuario, idRol) {
        try {
            // Primero verificamos si ya tiene un rol asignado
            const [existingRole] = await db.execute(`
                SELECT IDUsuarioRol FROM usuarioRol 
                WHERE IDUsuario = ?
            `, [idUsuario]);
            
            if (existingRole.length > 0) {
                // Actualizar rol existente
                await db.execute(`
                    UPDATE usuarioRol 
                    SET IDRol = ? 
                    WHERE IDUsuario = ?
                `, [idRol, idUsuario]);
            } else {
                // Insertar nuevo rol
                await db.execute(`
                    INSERT INTO usuarioRol (IDUsuario, IDRol)
                    VALUES (?, ?)
                `, [idUsuario, idRol]);
            }
            return true;
        } catch (error) {
            console.error("Error al asignar rol:", error);
            throw error;
        }
    }
}
module.exports = Usuario;