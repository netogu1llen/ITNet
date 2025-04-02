const db = require('../db');

class Seguimiento {
    static async getObjetivosByExpediente(idExpediente) {
        try {
            const result = await new Promise((resolve, reject) => {
                db.query('SELECT * FROM objetivos WHERE idExpediente = ?', [idExpediente]);
            });
            
            return result || [];
        } catch (error) {
            console.error('Error al obtener objetivos:', error);
            throw new Error('Error al obtener objetivos');
        }
    }
    
    static async getSeguimientoByExpediente(idExpediente) {
        try {
            const result = await new Promise((resolve, reject) => {
                db.query('SELECT * FROM seguimiento WHERE idExpediente = ?', [idExpediente]);
            });
            
            return result || [];
        } catch (error) {
            console.error('Error al obtener seguimiento:', error);
            throw new Error('Error al obtener seguimiento');
        }
    }

    static async actualizarSeguimiento(idExpediente, { objetivo, justificacion, analisis, recomendaciones, bitacora }) {
        try {
            await new Promise((resolve, reject) => {
                db.query('UPDATE seguimiento SET sesionObjetivo = ?, sesionJustificacion = ?, analisisPsicologico = ?, recomendaciones = ?, sesionBitacora = ? WHERE idExpediente = ?', 
                [objetivo, justificacion, analisis, recomendaciones, bitacora, idExpediente], (err, result) => {
                    if (err) reject(err);
                    resolve(result);
                });
            });
        } catch (error) {
            console.error('Error al actualizar seguimiento:', error);
            throw new Error('Error al actualizar seguimiento');
        }
    }

    static async actualizarObjetivo(idExpediente, { actividad, tiempo, metodologia, objetivo, observaciones }) {
        try {
            await new Promise((resolve, reject) => {
                db.query('UPDATE objetivos SET actividad = ?, tiempo = ?, metodologia = ?, objetivo = ?, observaciones = ? WHERE idExpediente = ?', 
                [actividad, tiempo, metodologia, objetivo, observaciones, idExpediente], (err, result) => {
                    if (err) reject(err);
                    resolve(result);
                });
            });
        } catch (error) {
            console.error('Error al actualizar objetivos:', error);
            throw new Error('Error al actualizar objetivos');
        }
    }

}

module.exports = Seguimiento;
