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

const get_editar_paciente= async (req, res) => {
    try {
        const idExpediente = req.params.id;
        const datosPaciente = await Pacientes.getPaciente(idExpediente);
        res.render('editarPaciente', {datos:datosPaciente[0][0]});
    } catch (error) {
        console.error('Error al obtener la información:', error.message);
        res.status(500).send('Error al obtener la información');
    }
};
const post_editar_paciente= async (req, res) => {
    try {
        const idExpediente = req.params.id;
        const { nombres, apellidoP, apellidoM, numExpediente, fechaNacimiento, contacto, direccion, enfermedades, medicamentos, estudioSocioeconomico, grado, curso, sangre} = req.body;        
        await Pacientes.editarPaciente({ 
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
            sangre,
            idExpediente
        });
        res.status(200).json({ mensaje: 'Datos registrados correctamente' });
        
    } catch (error) {
        console.error('Error al registrar:', error.message);
        res.status(500).json({ mensaje: 'Error al registrar. Favor de intentar en otro momento' });
    }
};
module.exports = { get_registrar_paciente, post_registrar_paciente, get_editar_paciente, post_editar_paciente};
