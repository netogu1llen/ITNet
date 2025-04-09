const db = require('../util/database');

class Seguimiento {
  /**
   * Obtiene un seguimiento por su ID.
   * @param {number} id
   * @returns {Promise<Object|null>}
   */
  static async obtenerSeguimientoPorId(id) {
    try {
      const [results] = await db.execute(
        'SELECT * FROM seguimientopsicologico WHERE IDSeguimiento = ?',
        [id]
      );

      return results.length === 0 ? null : results[0];
    } catch (err) {
      throw err;
    }
  }

  /**
   * Obtiene los objetivos de un seguimiento.
   * @param {number} id
   * @returns {Promise<Array>}
   */
  static async obtenerObjetivosPorSeguimientoId(id) {
    try {
      const [results] = await db.execute(
        'SELECT * FROM objetivos WHERE IDSeguimiento = ? AND eliminado = 0',
        [id]
      );
      return results;
    } catch (err) {
      throw err;
    }
  }

  /**
   * Actualiza un seguimiento.
   */
  static async actualizarSeguimiento(
    id,
    objetivoSesion,
    justificacionSesion,
    analisisPsicologico,
    recomendaciones,
    bitacora
  ) {
    try {
      await db.execute(
        'UPDATE seguimientopsicologico SET sesionObjetivo = ?, sesionJustificacion = ?, analisisPsicologico = ?, recomendaciones = ?, sesionBitacora = ? WHERE IDSeguimiento = ?',
        [
          objetivoSesion,
          justificacionSesion,
          analisisPsicologico,
          recomendaciones,
          bitacora,
          id
        ]
      );
    } catch (err) {
      throw err;
    }
  }

  /**
   * Elimina objetivos asociados a un seguimiento.
   * @param {number} id
   */
  static async eliminarObjetivosPorSeguimientoId(id) {
    try {
      await db.execute(
        'DELETE FROM objetivos WHERE IDSeguimiento = ? AND eliminado = 0',
        [id]
      );
    } catch (err) {
      console.error('Error al eliminar los objetivos:', err);
      throw err;
    }
  }

  /**
   * Inserta los objetivos en un seguimiento.
   */
  static async insertarObjetivos(
    id,
    actividad,
    tiempo,
    metodologia,
    objetivo,
    observaciones
  ) {
    try {
      await db.execute(
        'INSERT INTO objetivos SET IDSeguimiento = ?, actividad = ?, tiempo = ?, metodologia = ?, objetivo = ?, observaciones = ?, eliminado = 0',
        [id, actividad, tiempo, metodologia, objetivo, observaciones]
      );
    } catch (err) {
      console.error('Error al insertar los objetivos:', err);
      throw err;
    }
  }

  /**
   * Obtiene los datos generales del expediente por ID.
   * @param {number} idExpediente
   * @returns {Promise<Object>}
   */
  static async getDatosGenerales(idExpediente) {
    try {
      const [result] = await db.execute(
        `SELECT e.nombres, e.apellidoP, e.apellidoM, e.fechaNacimiento, e.direccion,
                ea.peso, ea.talla, ea.edad, b.grado
         FROM expediente e
         LEFT JOIN evaluacionantropometrica ea ON e.IDExpediente = ea.IDExpediente
         LEFT JOIN boleta b ON e.IDExpediente = b.IDExpediente
         WHERE e.IDExpediente = ?`,
        [idExpediente]
      );
      return result[0] || [];
    } catch (error) {
      console.error('Error al obtener seguimiento:', error);
      throw new Error('Error al obtener seguimiento');
    }
  }

  /**
   * Registra un nuevo seguimiento psicologico.
   */
  static async registrarSeguimiento(
    idExpediente,
    objetivoSesion,
    justificacionSesion,
    analisisPsicologico,
    recomendaciones,
    bitacora
  ) {
    try {
      const [result] = await db.execute(
        'INSERT INTO seguimientopsicologico SET sesionObjetivo = ?, sesionJustificacion = ?, analisisPsicologico = ?, recomendaciones = ?, sesionBitacora = ?, IDExpediente = ?, eliminado = 0',
        [
          objetivoSesion,
          justificacionSesion,
          analisisPsicologico,
          recomendaciones,
          bitacora,
          idExpediente
        ]
      );
      return result.insertId;
    } catch (error) {
      console.error('Error al registrar seguimiento:', error);
      throw new Error('Error al registrar seguimiento');
    }
  }
}

module.exports = Seguimiento;
