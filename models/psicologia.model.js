const db = require('../util/database');

class Psicologia {
    // Obtener documentos de la tabla documentosAdjuntos
    static async obtenerDocumentosAdjuntos(idExpediente) {
        try {
            const [results] = await db.execute(`
                SELECT IDDocumento AS idDocumento, IDExpediente AS idExpediente, nombre AS tipo, fecha AS fechaCreacion
                FROM documentosAdjuntos
                WHERE IDExpediente = ? AND eliminado = 0
            `, [idExpediente]);
            return results;
        } catch (error) {
            throw error;
        }
    }

    // Obtener documentos de la tabla seguimientoPsicologico
    static async obtenerSeguimientosPsicologicos(idExpediente) {
        try {
            const [results] = await db.execute(`
                SELECT IDSeguimiento AS idDocumento, IDExpediente AS idExpediente, 'seguimientoPsicologico' AS tipo, fecha AS fechaCreacion
                FROM seguimientoPsicologico
                WHERE IDExpediente = ? AND eliminado = 0
            `, [idExpediente]);
            return results;
        } catch (error) {
            throw error;
        }
    }

    // Obtener datos del expediente
    static async obtenerExpedientePorId(idExpediente) {
        try {
            const [results] = await db.execute(`
                SELECT nombres, apellidoP, apellidoM, IDExpediente, fechaNacimiento, contacto, direccion, grado, curso
                FROM expediente
                WHERE IDExpediente = ? AND eliminado = 0
            `, [idExpediente]);
            return results[0]; // Devuelve el primer resultado
        } catch (error) {
            throw error;
        }
    }

    // Registrar un nuevo documento
    static async registrarDocumento({ idExpediente, tipo, fechaCreacion, nombreArchivo }) {
        try {
            const [result] = await db.execute(`
                INSERT INTO documentosAdjuntos (IDExpediente, nombre, fecha, ubicacion)
                VALUES (?, ?, ?, ?)
            `, [idExpediente, tipo, fechaCreacion, nombreArchivo]);
            return result;
        } catch (error) {
            throw error;
        }
    }

    // Obtener un documento por ID
    static async obtenerDocumentoPorId(id) {
        try {
            const [results] = await db.execute(`
                SELECT IDDocumento AS idDocumento, IDExpediente, nombre AS tipo, fecha AS fechaCreacion, ubicacion AS nombreArchivo
                FROM documentosAdjuntos
                WHERE IDDocumento = ?
            `, [id]);
            return results[0];
        } catch (error) {
            throw error;
        }
    }

    // Eliminar un documento
    static async eliminarDocumento(id) {
        try {
            const [result] = await db.execute(`
                UPDATE documentosAdjuntos
                SET eliminado = 1
                WHERE IDDocumento = ?
            `, [id]);
            return result;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Psicologia;