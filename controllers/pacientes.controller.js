const Pacientes = require('../models/pacientes.model');
const { encrypt, decrypt } = require('../util/encryptData');

const getPacientes = async (req, res) => {
  try {
    res.render('pacientes', {datos: {idExpediente: 1}});
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
    // Encriptar los campos sensibles
    const pacienteEncriptado = {
      nombres: encrypt(nombres).encryptedData,
      apellidoP: encrypt(apellidoP).encryptedData,
      apellidoM: encrypt(apellidoM).encryptedData,
      fechaNacimiento: encrypt(fechaNacimiento).encryptedData,
      contacto: encrypt(contacto).encryptedData,
      direccion: encrypt(direccion).encryptedData,
      numExpediente,
      enfermedades,
      medicamentos,
      estudioSocioeconomico,
      grado,
      curso,
      sangre
    };
    await Pacientes.registrarPaciente(pacienteEncriptado);

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
    let paciente = datosPaciente;

    // Desencriptar campos sensibles
    console.log(paciente.nombres);
    paciente.nombres = decrypt(paciente.nombres);
    paciente.apellidoP = decrypt(paciente.apellidoP);
    paciente.apellidoM = decrypt(paciente.apellidoM);
    paciente.fechaNacimiento = decrypt(paciente.fechaNacimiento);
    paciente.contacto = decrypt(paciente.contacto);
    paciente.direccion = decrypt(paciente.direccion);
    console.log(paciente);


    res.render('editarPaciente', { datos: paciente});
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
      nombres: encrypt(nombres).encryptedData,
      apellidoP: encrypt(apellidoP).encryptedData,
      apellidoM: encrypt(apellidoM).encryptedData,
      fechaNacimiento: encrypt(fechaNacimiento).encryptedData,
      contacto: encrypt(contacto).encryptedData,
      direccion: encrypt(direccion).encryptedData,
      numExpediente,
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