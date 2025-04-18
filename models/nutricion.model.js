const db = require('../util/database');

class Nutricion {
    // Obtener todos los pacientes (excluyendo los eliminados)
    static async obtenerTodos() {
        try {
            const [results] = await db.execute(`
                SELECT IDExpediente, nombres, apellidoP, apellidoM, fechaNacimiento, nvEscolar
                FROM expediente
                WHERE eliminado IS NULL OR eliminado = 0
            `);
            return results;
        } catch (error) {
            throw error;
        }
    }

    // Obtener un paciente por su ID
    static async obtenerPorId(idExpediente) {
        try {
            const [rows] = await db.execute(`
                SELECT *
                FROM expediente
                WHERE IDExpediente = ? AND (eliminado IS NULL OR eliminado = 0)
            `, [idExpediente]);
            return rows[0]; // Devuelve el primer resultado
        } catch (error) {
            throw error;
        }
    }

    // Eliminar un paciente (marcado como eliminado)
    static async eliminar(idExpediente) {
        try {
            const [result] = await db.execute(`
                UPDATE expediente
                SET eliminado = 1
                WHERE IDExpediente = ?
            `, [idExpediente]);
            return result;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Nutricion;