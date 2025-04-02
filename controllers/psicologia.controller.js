const Seguimiento = require('../models/psicologia.model');

async function getSeguimiento(req, res) {
    try {
        const idExpediente = req.params.id;

        // Obtener todos los datos ya guardados de dos tablas
        const objetivos = await Seguimiento.getObjetivosByExpediente(idExpediente);
        const seguimiento = await Seguimiento.getSeguimientoByExpediente(idExpediente);
        
        res.render('editarSegPsico', {objetivos, seguimiento });

    } catch (error) {
        console.error('Error al obtener la información:', error.message);
        res.status(500).send('Error al obtener la información');
    }
}

module.exports = {getSeguimiento};