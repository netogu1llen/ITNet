const Seguimiento = require('../models/psicologia.model');

const getSeguimiento = async (req, res) => {
    try {
        const idExpediente = req.params.id;
        console.log('idExpediente:', idExpediente);

        const objetivos = await Seguimiento.getObjetivosByExpediente(idExpediente);
        const seguimiento = await Seguimiento.getSeguimientoByExpediente(idExpediente);

        if (objetivos.length === 0 || seguimiento.length === 0) {
            console.error('No se encontraron datos');
            return res.status(404).send('No se encontraron datos');
        }

        res.render('editarSegPsico', { objetivos, seguimiento });

    } catch (error) {
        console.error('Error al obtener la información:', error.message);
        res.status(500).send('Error al obtener la información');
    }
};


const actualizarSeguimiento = async (req, res) => {
    try {
        const idExpediente = req.params.id;
        const { objetivo, justificacion, actividad, tiempo, metodologia, objetivoActividad, observaciones, analisis, recomendaciones, bitacora } = req.body;

        await Seguimiento.actualizarSeguimiento(idExpediente, {objetivo, justificacion, analisis, recomendaciones, bitacora});

        actividad.forEach(async (act, i) => {
            await Seguimiento.actualizarObjetivo(idExpediente, {actividad: act, tiempo: tiempo[i], metodologia: metodologia[i], objetivo: objetivoActividad[i], observaciones: observaciones[i]});
        });

        res.redirect(`/psicologia/${idExpediente}`);
        
    } catch (error) {
        console.error('Error al actualizar:', error.message);
        res.status(500).send('Error al actualizar');
    }
};

// Función para renderizar la vista de expediente psicológico
const renderExpedientePsicologico = (req, res) => {
  try {
      // Renderizar la vista sin cargar datos adicionales
      res.render('expedientePsicologico');
  } catch (error) {
      console.error('Error al renderizar expediente psicológico:', error.message);
      res.status(500).send('Error al cargar la vista del expediente psicológico');
  }
};


// Función para eliminar un seguimiento psicológico
const eliminarSeguimiento = async (req, res) => {
  try {
      const idSeguimiento = req.params.id;

      // Llamar al modelo para eliminar el seguimiento
      await Seguimiento.eliminarSeguimiento(idSeguimiento);

      res.status(200).json({ message: 'Seguimiento eliminado correctamente' });
  } catch (error) {
      console.error('Error al eliminar seguimiento:', error.message);
      res.status(500).json({ error: 'Error al eliminar el seguimiento' });
  }
};

module.exports = { getSeguimiento, actualizarSeguimiento, eliminarSeguimiento, renderExpedientePsicologico };
