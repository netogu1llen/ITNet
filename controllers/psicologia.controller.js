const Seguimiento = require('../models/seguimiento.model');
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
        const { objetivoSesion, justificacionSesion, analisisPsicologico, recomendaciones, bitacora } = req.body;
        await Seguimiento.registrarSeguimiento(idExpediente, {objetivoSesion, justificacionSesion, analisisPsicologico, recomendaciones, bitacora});

        /*actividad.forEach(async (act, i) => {
            await Seguimiento.registrarObjetivo(idExpediente, {actividad: act, tiempo: tiempo[i], metodologia: metodologia[i], objetivo: objetivoActividad[i], observaciones: observaciones[i]});
        });
        */
        //res.redirect(`/psicologia/${idExpediente}`);
        res.status(200).json({ mensaje: 'Datos registrados correctamente' });
        
    } catch (error) {
        console.error('Error al registrar:', error.message);
        res.status(500).json({ mensaje: 'Error al registrar. Favor de intentar en otro momento' });
    }
};
module.exports = { get_registrar_seguimiento, post_registrar_seguimiento};