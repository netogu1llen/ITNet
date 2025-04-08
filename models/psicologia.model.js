const db = require('../util/database');

class Seguimiento {
  // Obtener seguimiento por ID
  static async obtenerPorId(id) {
    try {
      const [results] = await db.execute('SELECT * FROM seguimientopsicologico WHERE IDSeguimiento = ?', [id]);

      if (results.length === 0) {
        return null;
      }

      return results[0];
    } catch (err) {
      throw err;
    }
  }

  // Obtener objetivos por ID de seguimiento
  static async obtenerObjetivosPorSeguimientoId(id) {
    try {
      const [results] = await db.execute('SELECT * FROM objetivos WHERE IDSeguimiento = ? AND eliminado = 0', [id]);
      return results;
    } catch (err) {
      throw err;
    }
  }

  // Obtener los datos del expediente
  static async obtenerExpedientePorSeguimientoId(idSeguimiento) {
    const sql = `
      SELECT e.nombres, e.apellidoP, e.apellidoM, e.numExpediente, e.fechaNacimiento, 
             e.direccion, e.grado, e.curso
      FROM expediente e
      JOIN seguimientopsicologico s ON e.idExpediente = s.idExpediente
      WHERE s.idSeguimiento = ?
    `;
    try {
      const [results] = await db.execute(sql, [idSeguimiento]);
      return results[0];
    } catch (err) {
      throw err;
    }
  }

  // Actualizar seguimiento
  static async actualizarSeguimiento(id, objetivoSesion,justificacionSesion,analisisPsicologico,recomendaciones,bitacora) {
    
    try {
      await db.execute('UPDATE seguimientopsicologico SET sesionObjetivo = ?, sesionJustificacion = ?, analisisPsicologico = ?, recomendaciones = ?, sesionBitacora = ? WHERE IDSeguimiento = ?', [objetivoSesion, justificacionSesion, analisisPsicologico,recomendaciones,bitacora, id]);
    } catch (err) {
      throw err;
    }
  }

  // Eliminar objetivos por ID de seguimiento
  static async eliminarObjetivosPorSeguimientoId(id) {
    try {
      await db.execute('DELETE FROM objetivos WHERE IDSeguimiento = ? AND eliminado = 0', [id]);
    } catch (err) {
      console.error('Error al eliminaar los objetivos:', err);
      throw err;
    }
  }

  // Insertar objetivos
  static async insertarObjetivos(id, actividad, tiempo, metodologia, objetivo, observaciones) {
    try {
      await db.execute('INSERT INTO objetivos SET IDSeguimiento = ?, actividad = ?, tiempo = ?, metodologia = ?, objetivo = ?, observaciones = ?, eliminado = 0', [id, actividad, tiempo, metodologia, objetivo, observaciones]);
    } catch (err) {
      console.error('Error al insertar los objetivos:', err);
      throw err;
    
    }
  }
  static async getDatosGenerales(idExpediente) {
        try {
            const [result]= await db.execute('SELECT e.nombres, e.apellidoP,  e.apellidoM, e.fechaNacimiento,e.direccion, ea.peso, ea.talla,ea.edad, b.grado FROM expediente e LEFT JOIN evaluacionantropometrica ea ON e.IDExpediente = ea.IDExpediente LEFT JOIN boleta b ON e.IDExpediente = b.IDExpediente WHERE e.IDExpediente = ?;', [idExpediente]);
            return result[0] || [];
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
}
module.exports = Seguimiento;