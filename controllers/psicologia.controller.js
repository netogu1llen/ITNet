const Seguimiento = require('../models/psicologia.model');

const get_editar_seguimiento = async (req, res) => {
  const id = req.params.id;

  try {
    const seguimiento = await Seguimiento.obtenerPorId(id);
    if (!seguimiento) {
      return res.status(404).send('Seguimiento no encontrado');
    }

    const objetivos = await Seguimiento.obtenerObjetivosPorSeguimientoId(id);
    const expediente = await Seguimiento.obtenerExpedientePorSeguimientoId(id);

    res.render('editarSeguimiento', {
      seguimiento,
      objetivos: objetivos || [],
      expediente
    });
  } catch (err) {
    console.error('Error al obtener seguimiento:', err);
    return res.status(500).send('Error en el servidor');
  }
};

const post_editar_seguimiento = async (req, res) => {
  const id = req.params.id;
  const {
    objetivoSesion,
    justificacionSesion,
    analisisPsicologico,
    recomendaciones,
    bitacora,
    actividad = [], 
    tiempo = [],
    metodologia = [],
    objetivo= [],
    observaciones = []
  } = req.body;

  try {
    // Actualizar el seguimiento
    await Seguimiento.actualizarSeguimiento(id, {objetivoSesion,justificacionSesion,analisisPsicologico,recomendaciones,bitacora});

    // Eliminar los objetivos existentes
    await Seguimiento.eliminarObjetivosPorSeguimientoId(id);

    // Crear nuevos objetivos
    const maxLength = Math.max(
      actividad.length,
      tiempo.length,
      metodologia.length,
      objetivo.length,
      observaciones.length
    );
    for (let i = 0; i < maxLength; i++) {
      const obj = {
        idSeguimiento: id,
        actividad: actividad[i]?.trim() || '',
        tiempo: tiempo[i]?.trim() || '',
        metodologia: metodologia[i]?.trim() || '',
        objetivo: objetivo[i]?.trim() || '',
        observaciones: observaciones[i]?.trim() || ''
      };
      await Seguimiento.insertarObjetivos(obj);
    }

    // Redirigir al editar con estado de éxito
    res.status(200).json({ mensaje: 'Datos actualizados correctamente' });
  } catch (err) {
    console.error('Error al actualizar seguimiento:', err);
    res.status(500).json({ mensaje: 'Error al actualizar. Favor de intentar en otro momento' });
  }
};

// Exportar las funciones
module.exports = { get_editar_seguimiento, post_editar_seguimiento };
