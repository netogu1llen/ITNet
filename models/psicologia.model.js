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
}

module.exports = Seguimiento;