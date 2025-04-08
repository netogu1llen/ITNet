const Pacientes = require('../models/pacientes.model');

/**
 * Renderiza la vista para registrar un paciente.
 * @param {Request} req 
 * @param {Response} res 
 */
const getRegistrarPaciente = async (req, res) => {
  try {
    res.render('registrarPaciente');
  } catch (error) {
    console.error('Error al obtener la información:', error.message);
    res.status(500).send('Error al obtener la información');
  }
};

/**
 * Registra un nuevo paciente a partir del formulario.
 * @param {Request} req 
 * @param {Response} res 
 */
const postRegistrarPaciente = async (req, res) => {
  try {
    const {
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
    } = req.body;

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
    console.error('Error al registrar paciente:', error.message);
    res.status(500).json({
      mensaje: 'Error al registrar. Por favor, intenta nuevamente más tarde.'
    });
  }
};

module.exports = {
  getRegistrarPaciente,
  postRegistrarPaciente
};