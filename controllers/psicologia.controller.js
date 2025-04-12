const Seguimiento = require('../models/psicologia.model');
const { decrypt } = require('../util/encryptData');

/**
 * Obtiene los datos de seguimiento para editar.
 * @param {Request} req 
 * @param {Response} res 
 */
const getEditarSeguimiento = async (req, res) => {
  const id = req.params.id;

  try {
    const seguimiento = await Seguimiento.obtenerSeguimientoPorId(id);
    if (!seguimiento) {
      return res.status(404).send('Seguimiento no encontrado');
    }

    const objetivos = await Seguimiento.obtenerObjetivosPorSeguimientoId(id);
    const expediente = await Seguimiento.getDatosGenerales(id);

    let paciente = expediente;

    paciente.nombres = decrypt(paciente.nombres);
    paciente.apellidoP = decrypt(paciente.apellidoP);
    paciente.apellidoM = decrypt(paciente.apellidoM);
    paciente.fechaNacimiento = decrypt(paciente.fechaNacimiento);
    paciente.direccion = decrypt(paciente.direccion);

    res.render('editarSeguimiento', {
      seguimiento,
      objetivos: objetivos || [],
      expediente: paciente
    });
  } catch (err) {
    console.error('Error al obtener seguimiento:', err);
    return res.status(500).send('Error en el servidor');
  }
};

/**
 * Actualiza los datos del seguimiento.
 * @param {Request} req 
 * @param {Response} res 
 */
const postEditarSeguimiento = async (req, res) => {
  const id = req.params.id;
  const {
    objetivoSesion,
    justificacionSesion,
    analisisPsicologico,
    recomendaciones,
    bitacora,
    actividad = [], 
    tiempo = [],
    metodologia = [],
    objetivo = [], 
    observaciones = []
  } = req.body;

  try {
    // Actualizar el seguimiento
    await Seguimiento.actualizarSeguimiento(id, objetivoSesion, justificacionSesion, analisisPsicologico, recomendaciones, bitacora);

    // Eliminar los objetivos existentes
    await Seguimiento.eliminarObjetivosPorSeguimientoId(id);

    // Crear nuevos objetivos
    const maxLength = Math.max(
      actividad.length,
      tiempo.length,
      metodologia.length,
      objetivo.length,
      observaciones.length
    );

    for (let i = 0; i < maxLength; i++) {
      await Seguimiento.insertarObjetivos(id, actividad[i], tiempo[i], metodologia[i], objetivo[i], observaciones[i]);
    }

    // Respuesta de éxito
    res.status(200).json({ mensaje: 'Datos actualizados correctamente' });
  } catch (err) {
    console.error('Error al actualizar seguimiento:', err);
    res.status(500).json({ mensaje: 'Error al actualizar. Favor de intentar en otro momento' });
  }
};

/**
 * Renderiza la vista para registrar un nuevo seguimiento.
 * @param {Request} req 
 * @param {Response} res 
 */
const getRegistrarSeguimiento = async (req, res) => {
  try {
    const idExpediente = req.params.id;
    const expediente = await Seguimiento.getDatosGenerales(idExpediente);
    let paciente = expediente;
    // Desencriptar campos sensibles
    paciente.nombres = decrypt(paciente.nombres);
    paciente.apellidoP = decrypt(paciente.apellidoP);
    paciente.apellidoM = decrypt(paciente.apellidoM);
    paciente.fechaNacimiento = decrypt(paciente.fechaNacimiento);
    paciente.estado = decrypt(paciente.estado);
    paciente.ciudad = decrypt(paciente.ciudad);
    paciente.calle = decrypt(paciente.calle);
    paciente.cp = decrypt(paciente.cp);
    paciente.localidad = decrypt(paciente.localidad);
    paciente.numCasa = decrypt(paciente.numCasa);

    res.render('registrarSeguimiento', { expediente: paciente });
  } catch (error) {
    console.error('Error al obtener la información:', error.message);
    res.status(500).send('Error al obtener la información');
  }
};

/**
 * Registra un nuevo seguimiento.
 * @param {Request} req 
 * @param {Response} res 
 */
const postRegistrarSeguimiento = async (req, res) => {
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
      objetivo = [], 
      observaciones = []
    } = req.body;

    // Registrar seguimiento
    const idSeguimiento = await Seguimiento.registrarSeguimiento(idExpediente, objetivoSesion, justificacionSesion, analisisPsicologico, recomendaciones, bitacora);
    
    // Crear nuevos objetivos
    const maxLength = Math.max(
      actividad.length,
      tiempo.length,
      metodologia.length,
      objetivo.length,
      observaciones.length
    );

    for (let i = 0; i < maxLength; i++) {
      await Seguimiento.insertarObjetivos(idSeguimiento, actividad[i], tiempo[i], metodologia[i], objetivo[i], observaciones[i]);
    }

    // Respuesta de éxito
    res.status(200).json({ mensaje: 'Datos registrados correctamente' });
  } catch (error) {
    console.error('Error al registrar seguimiento:', error.message);
    res.status(500).json({ mensaje: 'Error al registrar. Favor de intentar en otro momento' });
  }
};

module.exports = { 
  getRegistrarSeguimiento, 
  postRegistrarSeguimiento, 
  getEditarSeguimiento, 
  postEditarSeguimiento 
};
