const Pacientes = require('../models/pacientes.model');
const get_registrar_paciente= async (req, res) => {
    try {
        res.render('registrarPaciente');
    } catch (error) {
        console.error('Error al obtener la información:', error.message);
        res.status(500).send('Error al obtener la información');
    }
};
const post_registrar_paciente= async (req, res) => {
    try {
        const { nombres, apellidoP, apellidoM, numExpediente, fechaNacimiento, contacto, direccion, enfermedades, medicamentos, estudioSocioeconomico, grado, curso, sangre} = req.body;        
        await Pacientes.registrarPaciente({ 
            nombres, 
            apellidoP, 
            apellidoM, 
            numExpediente, 
            fechaNacimiento, 
            contacto, 
            direccion, 
            enfermedades, 
            medicamentos, 
            estudioSocioeconomico, 
            grado, 
            curso, 
            sangre
        });
        res.status(200).json({ mensaje: 'Datos registrados correctamente' });
        
    } catch (error) {
        console.error('Error al registrar:', error.message);
        res.status(500).json({ mensaje: 'Error al registrar. Favor de intentar en otro momento' });
    }
};
module.exports = { get_registrar_paciente, post_registrar_paciente};
