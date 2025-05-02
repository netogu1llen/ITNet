const db = require('../util/database');
const { decrypt } = require('../util/encryptData');


/**
 * GET /api/psicologia/:idExpediente
 * Devuelve todos los seguimientos psicológicos de un expediente (formato JSON)
 */
const getSeguimientosPsicologia = async (req, res) => {
  try {
    const IDExpediente = req.params.idExpediente;

    // 1. Consulta datos del alumno
    const [alumnoRows] = await db.execute(`
      SELECT nombres, apellidoP, apellidoM 
      FROM expediente 
      WHERE IDExpediente = ? AND eliminado = 0
    `, [IDExpediente]);

    if (alumnoRows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Expediente no encontrado' 
      });
    }

    // 2. Consulta seguimientos psicológicos
    const [seguimientosRows] = await db.execute(`
      SELECT 
        IDSeguimiento AS idSeguimiento,
        numsesion AS numSesion,
        fecha,
        sesionobjetivo AS sesionObjetivo,
        sesionjustificacion AS sesionJustificacion,
        analisispsicologico AS analisisPsicologico,
        recomendaciones,
        sesionbitacora AS sesionBitacora
      FROM seguimientoPsicologico
      WHERE idExpediente = ? AND eliminado = 0
      ORDER BY numsesion ASC
    `, [IDExpediente]);

    // 3. Desencriptar campos sensibles (si aplica)
    const desencriptar = (dato) => {
      try {
        return dato ? decrypt(dato) : '';
      } catch (err) {
        console.error(`Error al desencriptar dato: ${err.message}`);
        return '[Error]';
      }
    };

    // 4. Formatear respuesta
    const alumno = alumnoRows[0];
    const response = {
      success: true,
      alumno: `${desencriptar(alumno.nombres)} ${desencriptar(alumno.apellidoP)} ${desencriptar(alumno.apellidoM)}`.trim(),
      results: seguimientosRows.map(seg => ({
        ...seg,
        sesionObjetivo: desencriptar(seg.sesionObjetivo),
        sesionJustificacion: desencriptar(seg.sesionJustificacion),
        // Aplica desencriptación a otros campos si es necesario
      }))
    };

    res.status(200).json(response);

  } catch (error) {
    console.error('❌ Error al obtener seguimientos psicológicos:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener datos psicológicos',
      error: error.message 
    });
  }
};

const getDetalleSeguimiento = async (req, res) => {
  try {
    const IDSeguimiento = req.params.idSeguimiento;

    // Validación básica del ID
    if (!IDSeguimiento || isNaN(IDSeguimiento)) {
      return res.status(400).json({
        success: false,
        message: 'ID de seguimiento inválido'
      });
    }

    // 1. Obtener el seguimiento principal
    const [seguimientoRows] = await db.execute(`
      SELECT 
        IDSeguimiento AS idSeguimiento,
        numSesion,
        DATE_FORMAT(fecha, '%Y-%m-%d') as fecha,
        sesionObjetivo,
        sesionJustificacion,
        analisisPsicologico,
        recomendaciones,
        sesionBitacora
      FROM seguimientoPsicologico 
      WHERE IDSeguimiento = ? AND eliminado = 0
    `, [IDSeguimiento]);

    if (seguimientoRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Seguimiento no encontrado'
      });
    }

    // 2. Obtener los objetivos psicológicos asociados
    const [objetivosRows] = await db.execute(`
      SELECT 
        idObjetivo,
        objetivo,
        actividad,
        tiempo,
        metodologia,
        observaciones
      FROM objetivoPsicologico
      WHERE IDSeguimiento = ? AND eliminado = 0
    `, [IDSeguimiento]);

    const seguimiento = seguimientoRows[0];
    const response = {
      success: true,
      detalle: {
        ...seguimiento,
        objetivos: objetivosRows.map(obj => ({
          idObjetivo: obj.idObjetivo,
          objetivo: obj.objetivo,
          actividad: obj.actividad,
          tiempo: obj.tiempo,
          metodologia: obj.metodologia,
          observaciones: obj.observaciones,
          fechaCreacion: obj.fechaCreacion,
          fechaActualizacion: obj.fechaActualizacion
        }))
      }
    };

    res.status(200).json(response);

  } catch (error) {
    console.error('Error en getDetalleSeguimiento:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

module.exports = { getSeguimientosPsicologia, getDetalleSeguimiento };