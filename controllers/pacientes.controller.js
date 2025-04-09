const Pacientes = require('../models/pacientes.model');

const getPacientes = async (req, res) => {
  try {
    res.render('pacientes');
  } catch (error) {
    console.error('Error al obtener la información:', error.message);
    res.status(500).send('Error al obtener la información');
  }
};

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

/**
 * Renderiza la vista para editar la información de un paciente.
 * @param {Request} req 
 * @param {Response} res 
 */
const getEditarPaciente = async (req, res) => {
  try {
    const idExpediente = req.params.id;
    const datosPaciente = await Pacientes.getPaciente(idExpediente);
    res.render('editarPaciente', { datos: datosPaciente[0][0] });
  } catch (error) {
    console.error('Error al obtener la información:', error.message);
    res.status(500).send('Error al obtener la información');
  }
};

/**
 * Actualiza la información de un paciente en la base de datos.
 * @param {Request} req 
 * @param {Response} res 
 */
const postEditarPaciente = async (req, res) => {
  try {
    const idExpediente = req.params.id;
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

    res.status(200).json({ mensaje: 'Datos actualizados correctamente' });
  } catch (error) {
    console.error('Error al actualizar paciente:', error.message);
    res.status(500).json({
      mensaje: 'Error al actualizar. Por favor, intenta nuevamente más tarde.'
    });
  }
};
const postEliminarPaciente= async (req, res) => {
  try {
      const idExpediente = req.params.id;     
      await Pacientes.eliminarPaciente(idExpediente);
      res.status(200).json({ mensaje: 'Datos eliminados correctamente' });
  } catch (error) {
      console.error('Error al eliminar:', error.message);
      res.status(500).json({ mensaje: 'Error al eliminar. Favor de intentar en otro momento' });
  }
};

module.exports = {
  getRegistrarPaciente,
  postRegistrarPaciente,
  getEditarPaciente,
  postEditarPaciente,
  postEliminarPaciente,
  getPacientes
};