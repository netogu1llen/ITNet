const { response } = require('express');
const db = require('../util/database');
class Seguimiento {
    static async getDatosGenerales(idExpediente) {
        try {
            const result= await db.execute('SELECT e.nombres, e.apellidoP,  e.apellidoM, e.fechaNacimiento,e.direccion, ea.peso, ea.talla,ea.edad, b.grado FROM expediente e LEFT JOIN evaluacionantropometrica ea ON e.IDExpediente = ea.IDExpediente LEFT JOIN boleta b ON e.IDExpediente = b.IDExpediente WHERE e.IDExpediente = ?;', [idExpediente]);
            return result || [];
        } catch (error) {
            console.error('Error al obtener seguimiento:', error);
            throw new Error('Error al obtener seguimiento');
        }
    }
    static async registrarSeguimiento(idExpediente, objetivoSesion, justificacionSesion, analisisPsicologico, recomendaciones, bitacora) {
        try {
            // Usamos el método de promesas para la consulta
            const [result] = await db.execute(
                'INSERT INTO seguimientopsicologico SET sesionObjetivo = ?, sesionJustificacion = ?, analisisPsicologico = ?, recomendaciones = ?, sesionBitacora = ?, IDExpediente = ?, eliminado = 0',
                [objetivoSesion, justificacionSesion, analisisPsicologico, recomendaciones, bitacora, idExpediente]
            );
            return result.insertId;
        } catch (error) {
            console.error('Error al registrar seguimiento:', error);
            throw new Error('Error al registrar seguimiento');
        }
    }
    // Insertar objetivos
    static async registrarObjetivos(idSeguimiento, actividad, tiempo, metodologia, objetivo, observaciones) {
      try {
        await db.execute('INSERT INTO objetivos SET IDSeguimiento = ?, actividad = ?, tiempo = ?, metodologia = ?, objetivo = ?, observaciones = ?, eliminado = 0', [idSeguimiento, actividad, tiempo, metodologia, objetivo, observaciones]);
      } catch (err) {
        console.error('Error al insertar los objetivos:', err);
        throw err;
      }
    }
}
module.exports = {Seguimiento};