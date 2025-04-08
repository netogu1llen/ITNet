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
    await Seguimiento.actualizarSeguimiento(id, objetivoSesion,justificacionSesion,analisisPsicologico,recomendaciones,bitacora);

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
      await Seguimiento.insertarObjetivos(id, actividad[i], tiempo[i], metodologia[i], objetivo[i], observaciones[i]);
     }

    // Redirigir al editar con estado de éxito
    res.status(200).json({ mensaje: 'Datos actualizados correctamente' });
  } catch (err) {
    console.error('Error al actualizar seguimiento:', err);
    res.status(500).json({ mensaje: 'Error al actualizar. Favor de intentar en otro momento' });
  }


};
const get_registrar_seguimiento= async (req, res) => {
    try {
        const idExpediente = req.params.id;
        const datosGenerales = await Seguimiento.getDatosGenerales(idExpediente);
        res.render('registrarSeguimiento', {datosGenerales: datosGenerales[0][0]});

    } catch (error) {
        console.error('Error al obtener la información:', error.message);
        res.status(500).send('Error al obtener la información');
    }
};
const post_registrar_seguimiento= async (req, res) => {
    try {
        const idExpediente = req.params.id;
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
        const idSeguimiento = await Seguimiento.registrarSeguimiento(idExpediente,objetivoSesion, justificacionSesion, analisisPsicologico, recomendaciones, bitacora);
        console.log("Seguimiento",idSeguimiento);
        // Crear nuevos objetivos
        const maxLength = Math.max(
          actividad.length,
          tiempo.length,
          metodologia.length,
          objetivo.length,
          observaciones.length
        );
        console.log(actividad, tiempo, metodologia, objetivo, observaciones);
        for (let i = 0; i < maxLength; i++) {
          await Seguimiento.registrarObjetivos(idSeguimiento, actividad[i], tiempo[i], metodologia[i], objetivo[i], observaciones[i]);
        }
        
        res.status(200).json({ mensaje: 'Datos registrados correctamente' });
        
    } catch (error) {
        console.error('Error al registrar:', error.message);
        res.status(500).json({ mensaje: 'Error al registrar. Favor de intentar en otro momento' });
    }
};
module.exports = { get_registrar_seguimiento, post_registrar_seguimiento, get_editar_seguimiento, post_editar_seguimiento };