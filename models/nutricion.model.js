const db = require('../util/database');

class Nutricion {
    // Obtener todos los historiales clínicos (relación usuario-expediente)
    static async obtenerTodos() {
        try {
            const [rows] = await db.execute(`
                SELECT ue.IDConsulta, ue.numSesion, ue.fecha,
                       e.nombres, e.apellidoP, e.apellidoM
                FROM usuarioExpediente ue
                INNER JOIN expediente e ON ue.IDExpediente = e.IDExpediente
                WHERE e.eliminado = 0
            `);
            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Obtener historial por ID para cargar en el modal de modificación
    static async obtenerPorId(idConsulta) {
        try {
            const [rows] = await db.execute(`
                SELECT ue.IDConsulta, ue.IDExpediente, ue.numSesion, ue.fecha
                FROM usuarioExpediente ue
                WHERE ue.IDConsulta = ?
            `, [idConsulta]);
            return rows[0]; // Devuelve el primer resultado
        } catch (error) {
            throw error;
        }
    }

    // Modificar un historial clínico
    static async modificar(idConsulta, { numSesion, fecha }) {
        try {
            const [result] = await db.execute(`
                UPDATE usuarioExpediente
                SET numSesion = ?, fecha = ?
                WHERE IDConsulta = ?
            `, [numSesion, fecha, idConsulta]);
            return result;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Nutricion;
