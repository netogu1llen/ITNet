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
    
    // Obtener datos del expediente - ACTUALIZADO con nuevas agrupaciones
    static async obtenerExpedientePorId(idExpediente) {
        try {
            const [results] = await db.execute(`
                SELECT 
                    CONCAT(nombres, ' ', apellidoP, ' ', apellidoM) AS nombreCompleto,
                    fechaNacimiento, 
                    contacto, 
                    CONCAT(estado, ', ', ciudad) AS ubicacion, 
                    CONCAT(calle, ' ', numCasa) AS domicilio,
                    grado, 
                    nvEscolar AS curso,
                    numExpediente
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
    
    // Método para subir documento (corregido para usar la tabla documentosAdjuntos)
    static async subirPrueba({ IDExpediente, nombre, ubicacion, fecha, eliminado }) {
        try {
            console.log('Insertando en BD:', { IDExpediente, nombre, ubicacion, fecha, eliminado });
            
            const [result] = await db.execute(
                `INSERT INTO documentosAdjuntos (IDExpediente, nombre, ubicacion, fecha, eliminado)
                VALUES (?, ?, ?, ?, ?)`,
                [IDExpediente, nombre, ubicacion, fecha, eliminado]
            );
            return result;
        } catch (error) {
            throw error;
        }
    }

  // Obtener seguimiento por ID
  static async obtenerPorId(id) {
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

  // Obtener objetivos por ID de seguimiento - ACTUALIZADO
  static async obtenerObjetivosPorSeguimientoId(id) {
    try {
      const [results] = await db.execute('SELECT * FROM objetivoPsicologico WHERE IDSeguimiento = ? AND eliminado = 0', [id]);
      return results;
    } catch (err) {
      throw err;
    }
  }

  // Obtener los datos del expediente - ACTUALIZADO con nuevas agrupaciones
  static async obtenerExpedientePorSeguimientoId(idSeguimiento) {
    const sql = `
        SELECT 
            CONCAT(e.nombres, ' ', e.apellidoP, ' ', e.apellidoM) AS nombreCompleto,
            e.numExpediente, 
            e.fechaNacimiento, 
            CONCAT(e.estado, ', ', e.ciudad) AS ubicacion, 
            CONCAT(e.calle, ' ', e.numCasa) AS domicilio,
            e.grado, 
            e.nvEscolar AS curso
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

  // Eliminar objetivos por ID de seguimiento - ACTUALIZADO
  static async eliminarObjetivosPorSeguimientoId(id) {
    try {
      await db.execute('DELETE FROM objetivoPsicologico WHERE IDSeguimiento = ? AND eliminado = 0', [id]);
    } catch (err) {
      console.error('Error al eliminar los objetivos:', err);
      console.error('Error al eliminar los objetivos:', err);
      throw err;
    }
  }

  // Insertar objetivos - ACTUALIZADO
  static async insertarObjetivos(id, actividad, tiempo, metodologia, objetivo, observaciones) {
    try {
      await db.execute('INSERT INTO objetivoPsicologico SET IDSeguimiento = ?, actividad = ?, tiempo = ?, metodologia = ?, objetivo = ?, observaciones = ?, eliminado = 0', [id, actividad, tiempo, metodologia, objetivo, observaciones]);
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
            const [result] = await db.execute(`
                SELECT 
                    CONCAT(e.nombres, ' ', e.apellidoP, ' ', e.apellidoM) AS nombreCompleto,
                    e.fechaNacimiento,
                    e.contacto,
                    CONCAT(e.estado, ', ', e.ciudad) AS ubicacion, 
                    CONCAT(e.calle, ' ', e.numCasa) AS domicilio,
                    ea.peso, 
                    ea.talla, 
                    ea.edad, 
                    b.grado,
                    e.nvEscolar AS curso,
                    e.numExpediente
                FROM expediente e 
                LEFT JOIN evaluacionantropometrica ea ON e.IDExpediente = ea.IDExpediente 
                LEFT JOIN boleta b ON e.IDExpediente = b.IDExpediente 
                WHERE e.IDExpediente = ?;
            `, [idExpediente]);
            return result[0] || [];
        } catch (error) {
            console.error('Error al obtener seguimiento:', error);
            throw new Error('Error al obtener seguimiento');
        }
    }
    static async registrarSeguimiento(idExpediente, objetivoSesion, justificacionSesion, analisisPsicologico, recomendaciones, bitacora) {
        try {
            const fecha = new Date();  // Fecha de creación
            // Se inserta el seguimiento sin valor para "ubicacion"
            const [result] = await db.execute(
                'INSERT INTO seguimientopsicologico SET sesionObjetivo = ?, sesionJustificacion = ?, analisisPsicologico = ?, recomendaciones = ?, sesionBitacora = ?, IDExpediente = ?, fecha = ?, eliminado = 0',
                [objetivoSesion, justificacionSesion, analisisPsicologico, recomendaciones, bitacora, idExpediente, fecha]
            );
            return result.insertId;
        } catch (error) {
            console.error('Error al registrar seguimiento:', error);
            throw new Error('Error al registrar seguimiento');
        }
    }
    static async eliminarSeguimiento(id) {
        try {
            await db.execute('UPDATE seguimientopsicologico SET eliminado = 1 WHERE IDSeguimiento = ?', [id]);
        } catch (error) {
            console.error('Error al eliminar seguimiento:', error);
            throw new Error('Error al eliminar seguimiento');
        }
    }   
}
module.exports = Psicologia;