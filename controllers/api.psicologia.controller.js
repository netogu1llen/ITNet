const Psicologia = require('../models/psicologia.model');

/**
 * GET /api/psicologia/:idExpediente
 * Devuelve todas los documentos de seguimiento de un expediente + nombre del alumno
 */
const getSeguimientoByExpediente = async (req, res) => {
  try {
    const IDExpediente = req.params.idExpediente;

    const seguimientos = await Psicologia.obtenerSeguimientoPorExpediente(IDExpediente);
    const alumnoNombre = await Psicologia.obtenerNombreAlumno(IDExpediente); // <- ya existe este método en tu modelo

    const seguimientoFormateadas = seguimientos.map(seguimiento => ({
      IDSeguimiento: seguimiento.IDSeguimiento,
      IDExpediente: seguimiento.IDExpediente,
      numSesion: seguimiento.numSesion,
      fecha: seguimiento.fecha,
      sesionObjetivo: seguimiento.sesionObjetivo,
      sesionJustificacion: seguimiento.sesionJustificacion,
      analisisPsicologico: seguimiento.analisisPsicologico,
      recomendaciones: seguimiento.recomendaciones,
      sesionBitacora: seguimiento.sesionBitacora,
      eliminado: seguimiento.eliminado
    }));

    res.status(200).json({
      success: true,
      alumno: alumnoNombre,
      results: seguimientoFormateadas
    });
  } catch (error) {
    console.error('❌ Error al obtener los seguimientos:', error);
    res.status(500).send('Error al obtener los seguimientos');
  }
};

/**
 * GET /api/psicologia/:IDExpediente
 * Devuelve detalle del expediente de psicologia (seguimiento y objetivos).
 */
const getSeguimientoDetalle = async (req, res) => {
  try {
    const IDSeguimiento = req.params.IDSeguimiento;
    const detalle = await Psicologia.obtenerPorId(IDExpediente);

    res.status(200).json({
      success: true,
      psicologia: {
        IDExpediente: detalle.psicologia.IDExpediente,
        IDExpediente: detalle.seguimiento.IDExpediente,
        numSesion: detalle.seguimiento.numSesion,
        fecha: detalle.seguimiento.fecha,
        sesionObjetivo: detalle.seguimiento.sesionObjetivo,
        sesionJustificacion: detalle.seguimiento.sesionJustificacion,
        analisisPsicologico: detalle.seguimiento.analisisPsicologico,
        recomendaciones: detalle.seguimiento.recomendaciones,
        sesionBitacora: detalle.seguimiento.sesionBitacora,
        eliminado: detalle.seguimiento.eliminado
      }
    });
  } catch (error) {
    console.error('❌ Error al obtener detalle de psicologia:', error);
    res.status(500).send('Error al obtener detalle de psicologia');
  }
};

module.exports = {
  getSeguimientoByExpediente,
  getSeguimientoDetalle
};