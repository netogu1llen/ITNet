const seguimientoModel = require('../models/psicologia.model');

exports.obtenerSeguimientoPorId = (req, res) => {
  const id = req.params.id;

  seguimientoModel.obtenerPorId(id, (err, seguimiento) => {
    if (err) {
      console.error('Error al obtener el seguimiento:', err);
      return res.status(500).send('Error en el servidor');
    }

    if (!seguimiento) {
      return res.status(404).send('Seguimiento no encontrado');
    }

    seguimientoModel.obtenerObjetivosPorSeguimientoId(id, (err, objetivos) => {
      if (err) {
        console.error('Error al obtener los objetivos:', err);
        return res.status(500).send('Error en el servidor');
      }

      seguimientoModel.obtenerExpedientePorSeguimientoId(id, (err, expediente) => {
        if (err) {
          console.error('Error al obtener expediente:', err);
          return res.status(500).send('Error en el servidor');
        }

        res.render('editarSegPsico', {
          seguimiento,
          objetivos: objetivos || [],
          expediente
        });
      });
    });
  });
};

exports.actualizarSeguimiento = (req, res) => {
    const id = req.params.id;
    const {
      objetivo,
      justificacion,
      analisis,
      recomendaciones,
      bitacora,
      actividad = [], 
      tiempo = [],
      metodologia = [],
      objetivoActividad = [],
      observaciones = []
    } = req.body;
  
    const seguimientoData = {
      sesionObjetivo: objetivo,
      sesionJustificacion: justificacion,
      analisisPsicologico: analisis,
      recomendaciones: recomendaciones,
      sesionBitacora: bitacora
    };
  
    seguimientoModel.actualizarSeguimiento(id, seguimientoData, (err) => {
      if (err) {
        console.error('Error al actualizar seguimiento:', err);
        return res.redirect(`/psicologia/seguimiento/editar/${id}?estado=error`);
      }
  
      seguimientoModel.eliminarObjetivosPorSeguimientoId(id, (err) => {
        if (err) {
          console.error('Error al eliminar objetivos anteriores:', err);
          return res.redirect(`/psicologia/seguimiento/editar/${id}?estado=error`);
        }
  
        const nuevosObjetivos = actividad.map((_, i) => ({
          idSeguimiento: id,
          actividad: actividad[i],
          tiempo: tiempo[i],
          metodologia: metodologia[i],
          objetivo: objetivoActividad[i],
          observaciones: observaciones[i]
        }));
  
        seguimientoModel.insertarObjetivos(nuevosObjetivos, (err) => {
          if (err) {
            console.error('Error al insertar nuevos objetivos:', err);
            return res.redirect(`/psicologia/seguimiento/editar/${id}?estado=error`);
          }
  
          res.redirect(`/psicologia/seguimiento/editar/${id}?estado=exito`);
        });
      });
    });
  };  