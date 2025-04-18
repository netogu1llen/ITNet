const Pacientes = require('../models/pacientes.model');
const { encrypt, decrypt } = require('../util/encryptData');

// Modificar el método getPacientes para usar nvEscolar en lugar de enfermedades

const getPacientes = async (req, res) => {
  try {
    const pacientes = await Pacientes.obtenerTodos();
    
    // Desencriptar datos sensibles con manejo de errores
    const pacientesDesencriptados = pacientes.map(paciente => {
      try {
        // Verificar que cada campo existe antes de desencriptar
        if (!paciente.nombres || !paciente.apellidoP || !paciente.apellidoM || !paciente.fechaNacimiento) {
          return {
            IDExpediente: paciente.IDExpediente,
            nombreCompleto: '[Datos incompletos]',
            fechaNacimiento: '[Fecha no disponible]',
            nvEscolar: paciente.nvEscolar || 'Sin nivel registrado'
          };
        }
        
        // Desencriptar con manejo específico para cada campo
        let nombres, apellidoP, apellidoM, fechaNacimiento;
        
        try { nombres = decrypt(paciente.nombres); } 
        catch (e) { nombres = '[Error]'; console.error(`Error al desencriptar nombre: ${e.message}`); }
        
        try { apellidoP = decrypt(paciente.apellidoP); } 
        catch (e) { apellidoP = '[Error]'; console.error(`Error al desencriptar apellido paterno: ${e.message}`); }
        
        try { apellidoM = decrypt(paciente.apellidoM); } 
        catch (e) { apellidoM = '[Error]'; console.error(`Error al desencriptar apellido materno: ${e.message}`); }
        
        try { fechaNacimiento = decrypt(paciente.fechaNacimiento); } 
        catch (e) { fechaNacimiento = '[Error]'; console.error(`Error al desencriptar fecha: ${e.message}`); }
        
        return {
          IDExpediente: paciente.IDExpediente,
          nombreCompleto: `${nombres} ${apellidoP} ${apellidoM}`.trim(),
          fechaNacimiento: fechaNacimiento,
          nvEscolar: paciente.nvEscolar || 'Sin nivel registrado'
        };
      } catch (error) {
        console.error(`Error al desencriptar paciente ID ${paciente.IDExpediente}:`, error);
        // En caso de error, devolvemos datos genéricos para ese paciente
        return {
          IDExpediente: paciente.IDExpediente,
          nombreCompleto: '[Error en datos]',
          fechaNacimiento: '[Error en fecha]',
          nvEscolar: paciente.nvEscolar || 'Sin nivel registrado'
        };
      }
    });
    
    res.render('pacientes', { pacientes: pacientesDesencriptados });
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
      fechaNacimiento,
      contacto,
      estado,
      ciudad,
      calle,
      cp,
      localidad,
      numCasa,
      numExpediente,
      enfermedades,
      medicamentos,
      estudioSocioeconomico,
      grado,
      nvEscolar,
      sangre
    } = req.body;
    // Encriptar los campos sensibles
    const pacienteEncriptado = {
      nombres: encrypt(nombres).encryptedData,
      apellidoP: encrypt(apellidoP).encryptedData,
      apellidoM: encrypt(apellidoM).encryptedData,
      fechaNacimiento: encrypt(fechaNacimiento).encryptedData,
      contacto: encrypt(contacto).encryptedData,
      estado: encrypt(estado).encryptedData,
      ciudad: encrypt(ciudad).encryptedData,
      calle: encrypt(calle).encryptedData,
      cp: encrypt(cp).encryptedData,
      localidad: encrypt(localidad).encryptedData,
      numCasa: encrypt(numCasa).encryptedData,
      numExpediente,
      enfermedades,
      medicamentos,
      estudioSocioeconomico,
      grado,
      nvEscolar,
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
    paciente.nombres = decrypt(paciente.nombres);
    paciente.apellidoP = decrypt(paciente.apellidoP);
    paciente.apellidoM = decrypt(paciente.apellidoM);
    paciente.fechaNacimiento = decrypt(paciente.fechaNacimiento);
    paciente.contacto = decrypt(paciente.contacto);
    paciente.estado = decrypt(paciente.estado);
    paciente.ciudad = decrypt(paciente.ciudad);
    paciente.calle = decrypt(paciente.calle);
    paciente.cp = decrypt(paciente.cp);
    paciente.localidad = decrypt(paciente.localidad);
    paciente.numCasa = decrypt(paciente.numCasa);


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
      fechaNacimiento,
      contacto,
      estado,
      ciudad,
      calle,
      cp,
      localidad,
      numCasa,
      numExpediente,
      enfermedades,
      medicamentos,
      estudioSocioeconomico,
      grado,
      nvEscolar,
      sangre
    } = req.body;
    const pacienteEncriptado = {
      nombres: encrypt(nombres).encryptedData,
      apellidoP: encrypt(apellidoP).encryptedData,
      apellidoM: encrypt(apellidoM).encryptedData,
      fechaNacimiento: encrypt(fechaNacimiento).encryptedData,
      contacto: encrypt(contacto).encryptedData,
      estado: encrypt(estado).encryptedData,
      ciudad: encrypt(ciudad).encryptedData,
      calle: encrypt(calle).encryptedData,
      cp: encrypt(cp).encryptedData,
      localidad: encrypt(localidad).encryptedData,
      numCasa: encrypt(numCasa).encryptedData,
      numExpediente,
      enfermedades,
      medicamentos,
      estudioSocioeconomico,
      grado,
      nvEscolar,
      sangre,
      idExpediente
    };

    await Pacientes.editarPaciente(pacienteEncriptado);

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