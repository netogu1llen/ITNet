const { response } = require('express');
const db = require('../util/database');
class Seguimiento {
    static async getDatosGenerales(idExpediente) {
        try {
            const result= await db.execute('SELECT e.nombres, e.apellidoP,  e.apellidoM, e.fechaNacimiento,e.direccion, ea.peso, ea.talla,ea.edad, b.grado FROM expediente e LEFT JOIN evaluacionantropometrica ea ON e.IDExpediente = ea.IDExpediente LEFT JOIN boleta b ON e.IDExpediente = b.IDExpediente WHERE e.IDExpediente = ?;', [idExpediente]);
            return result || [];
        } catch (error) {
            console.error('Error al obtener objetivos:', error);
            throw new Error('Error al obtener objetivos');
        }
    }
    static async registrarSeguimiento(idExpediente, { objetivoSesion, justificacionSesion, analisisPsicologico, recomendaciones, bitacora }) {
        try {
            // Usamos el método de promesas para la consulta
            const [result] = await db.execute(
                'INSERT INTO seguimientopsicologico SET sesionObjetivo = ?, sesionJustificacion = ?, analisisPsicologico = ?, recomendaciones = ?, sesionBitacora = ?, idExpediente = ?',
                [objetivoSesion, justificacionSesion, analisisPsicologico, recomendaciones, bitacora, idExpediente]
            );
        } catch (error) {
            console.error('Error al registrar seguimiento:', error);
            throw new Error('Error al actualizar seguimiento');
        }
    }
    static async registrarObjetivo(idExpediente, { actividad, tiempo, metodologia, objetivo, observaciones }) {
        try {
            await new Promise((resolve, reject) => {
                db.query('INSERT INTO objetivos SET actividad = ?, tiempo = ?, metodologia = ?, objetivo = ?, observaciones = ?, idExpediente = ?', 
                [actividad, tiempo, metodologia, objetivo, observaciones, idExpediente], (err, result) => {
                    if (err) reject(err);
                    resolve(result);
                });
            });
        } catch (error) {
            console.error('Error al registrar objetivos:', error);
            throw new Error('Error al registrar objetivos');
        }
    }
}
module.exports = Seguimiento;