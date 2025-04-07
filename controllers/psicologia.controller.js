const {Seguimiento} = require('../models/psicologia.model');
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
module.exports = { get_registrar_seguimiento, post_registrar_seguimiento};