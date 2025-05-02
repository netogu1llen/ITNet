const Educacion = require('../models/educacion.model');

/**
 * GET /api/boletas/:idExpediente
 * Devuelve todas las boletas de un expediente + nombre del alumno
 */
const getBoletasByExpediente = async (req, res) => {
  try {
    const IDExpediente = req.params.idExpediente;

    const boletas = await Educacion.obtenerBoletasPorExpediente(IDExpediente);
    const alumnoNombre = await Educacion.obtenerNombreAlumno(IDExpediente); // <- ya existe este método en tu modelo

    const boletasFormateadas = boletas.map(boleta => ({
      IDBoleta: boleta.IDBoleta,
      periodoEscolar: boleta.periodoEscolar,
      grado: boleta.grado,
      nvEscolar: boleta.nvEscolar,
      promedio: boleta.promedio
    }));

    res.status(200).json({
      success: true,
      alumno: alumnoNombre,
      results: boletasFormateadas
    });
  } catch (error) {
    console.error('Error al obtener boletas:', error);
    res.status(500).send('Error al obtener boletas');
  }
};

/**
 * GET /api/boleta/:idBoleta
 * Devuelve detalle de boleta (materias y calificaciones).
 */
const getBoletaDetalle = async (req, res) => {
  try {
    const IDBoleta = req.params.idBoleta;
    const detalle = await Educacion.obtenerBoletaPorId(IDBoleta);

    res.status(200).json({
      success: true,
      boleta: {
        IDBoleta: detalle.boleta.IDBoleta,
        periodoEscolar: detalle.boleta.periodoEscolar,
        grado: detalle.boleta.grado,
        materias: detalle.materias.map(m => ({
          nombre: m.materia,
          calificacion: m.calificacion
        }))
      }
    });
  } catch (error) {
    console.error('Error al obtener detalle de boleta:', error);
    res.status(500).send('Error al obtener detalle de boleta');
  }
};

module.exports = {
  getBoletasByExpediente,
  getBoletaDetalle
};
