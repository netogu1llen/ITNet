const db = require('../util/database');

/**
 * GET /api/nutricional/:idExpediente
 * Devuelve todos los datos nutricionales asociados a un expediente.
 */
const getDatosNutricionales = async (req, res) => {
    const { idExpediente } = req.params;
  
    // Verificar que se pasó el IDExpediente
    if (!idExpediente) {
      return res.status(400).json({ success: false, message: 'IDExpediente es requerido' });
    }
  
    try {
      // Obtener solo el último registro de cada tabla
      const [nutricional] = await db.execute(`
        SELECT * FROM nutricional1 WHERE IDExpediente = ? AND (eliminado IS NULL OR eliminado = 0)
        ORDER BY fecha DESC LIMIT 1
      `, [idExpediente]);
  
      const [indicadoresClinicos] = await db.execute(`
        SELECT * FROM indicadoresClinicos WHERE IDExpediente = ? AND (eliminado IS NULL OR eliminado = 0)
        ORDER BY fecha DESC LIMIT 1
      `, [idExpediente]);
  
      const [transtornos] = await db.execute(`
        SELECT * FROM transtornos WHERE IDExpediente = ? AND (eliminado IS NULL OR eliminado = 0)
        ORDER BY fecha DESC LIMIT 1
      `, [idExpediente]);
  
      const [actividadDiaria] = await db.execute(`
        SELECT * FROM actividadDiaria WHERE IDExpediente = ? AND (eliminado IS NULL OR eliminado = 0)
        ORDER BY fecha DESC LIMIT 1
      `, [idExpediente]);
  
      const [indicadoresBioquim] = await db.execute(`
        SELECT * FROM indicadoresBioquim WHERE IDExpediente = ? AND (eliminado IS NULL OR eliminado = 0)
        ORDER BY parametroFecha DESC LIMIT 1
      `, [idExpediente]);
  
      const [evaluacionAntropometrica] = await db.execute(`
        SELECT * FROM evaluacionAntropometrica WHERE IDExpediente = ? AND (eliminado IS NULL OR eliminado = 0)
        ORDER BY fecha DESC LIMIT 1
      `, [idExpediente]);
  
      const [diagnosticoEvolucion] = await db.execute(`
        SELECT * FROM diagnosticoEvolucion WHERE IDExpediente = ? AND (eliminado IS NULL OR eliminado = 0)
        ORDER BY fecha DESC LIMIT 1
      `, [idExpediente]);
  
      const [objetivoNutricional] = await db.execute(`
        SELECT * FROM objetivoNutricional WHERE IDExpediente = ? AND (eliminado IS NULL OR eliminado = 0)
        ORDER BY fecha DESC LIMIT 1
      `, [idExpediente]);
  
      const [manejoNutricional] = await db.execute(`
        SELECT * FROM manejoNutricional WHERE IDExpediente = ? AND (eliminado IS NULL OR eliminado = 0)
        ORDER BY fecha DESC LIMIT 1
      `, [idExpediente]);
  
      // Organizar los datos de las diferentes tablas
      const response = {
        nutricional: nutricional[0] || null,
        indicadoresClinicos: indicadoresClinicos[0] || null,
        transtornos: transtornos[0] || null,
        actividadDiaria: actividadDiaria[0] || null,
        indicadoresBioquim: indicadoresBioquim[0] || null,
        evaluacionAntropometrica: evaluacionAntropometrica[0] || null,
        diagnosticoEvolucion: diagnosticoEvolucion[0] || null,
        objetivoNutricional: objetivoNutricional[0] || null,
        manejoNutricional: manejoNutricional[0] || null
      };
  
      res.status(200).json({
        success: true,
        data: response
      });
  
    } catch (error) {
      console.error('Error al obtener los datos nutricionales:', error);
      res.status(500).json({ success: false, message: 'Error al obtener los datos nutricionales' });
    }
  };  

module.exports = {
  getDatosNutricionales
};
