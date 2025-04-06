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
  