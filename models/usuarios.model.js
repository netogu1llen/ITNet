const db = require('../util/database');

class Usuario {
    // Obtener todos los usuarios (excluyendo los eliminados)
    static async obtenerTodos() {
        try {
            const [results] = await db.execute(`
                SELECT u.IDUsuario, u.nombreUsuario, u.numTelefono, u.fechaNacimiento, r.Tipo AS rol
                FROM usuario u
                LEFT JOIN usuarioRol ur ON u.IDUsuario = ur.IDUsuario
                LEFT JOIN rol r ON ur.IDRol = r.IDRol
                WHERE u.eliminado IS NULL OR u.eliminado = 0
            `);
            return results;
        } catch (error) {
            throw error;
        }
    }

    // Registrar un nuevo usuario
    static async registrar({ nombreUsuario, numTelefono, fechaNacimiento, contrasena }) {
        try {
            const [result] = await db.execute(`
                INSERT INTO usuario (nombreUsuario, numTelefono, fechaNacimiento, contrasena)
                VALUES (?, ?, ?, ?)
            `, [nombreUsuario, numTelefono, fechaNacimiento, contrasena]);
            return result;
        } catch (error) {
            throw error;
        }
    }

    // Obtener un usuario por ID (para el modal de modificación)
    static async obtenerPorId(idUsuario) {
        try {
            const [results] = await db.execute(`
                SELECT IDUsuario, nombreUsuario, numTelefono, fechaNacimiento, contrasena
                FROM usuario
                WHERE IDUsuario = ?
            `, [idUsuario]);
            return results[0]; // Devuelve el primer resultado
        } catch (error) {
            throw error;
        }
    }


    // Modificar un usuario existente
    static async modificar(idUsuario, { nombreUsuario, numTelefono, fechaNacimiento, contrasena }) {
        try {
            const [result] = await db.execute(`
                UPDATE usuario
                SET nombreUsuario = ?, numTelefono = ?, fechaNacimiento = ?, contrasena = ?
                WHERE IDUsuario = ?
            `, [nombreUsuario, numTelefono, fechaNacimiento, contrasena, idUsuario]);
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
}

module.exports = Usuario;