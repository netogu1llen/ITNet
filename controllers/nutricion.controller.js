const Nutricion = require('../models/nutricion.model');
const { decrypt } = require('../util/encryptData');
const { request, response } = require("express");

// Obtener todos los pacientes para nutrición
exports.obtenerHistoriales = async (req, res) => {
  try {
    const pacientes = await Nutricion.obtenerTodos();
    
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
    
    res.render('nutricion', { pacientes: pacientesDesencriptados });
  } catch (error) {
    console.error('Error al obtener la información:', error.message);
    res.status(500).send('Error al obtener la información');
  }
};

// Eliminar un paciente
exports.eliminarHistorial = async (req, res) => {
  try {
    const idExpediente = req.params.id;
    await Nutricion.eliminar(idExpediente);
    res.status(200).json({ mensaje: 'Datos eliminados correctamente' });
  } catch (error) {
    console.error('Error al eliminar:', error.message);
    res.status(500).json({ mensaje: 'Error al eliminar. Favor de intentar en otro momento' });
  }
};

// Mostrar el formulario de historia clínica con datos del expediente
exports.renderHistoriaClinica = async (req, res) => {
  try {
    const IDExpediente = req.params.id;

    const expediente = await Nutricion.obtenerPorId(IDExpediente);
    
    
    res.render('historiaClinica', { expediente });
  } catch (error) {
    console.error('Error al renderizar historia clínica:', error);
    res.status(500).send('Error interno al mostrar la historia clínica');
  }
};

exports.guardarHistoriaClinicaV1 = async (req, res) => {
  try {
    const datos = req.body;
    //console.log('Datos recibidos para guardar en historiaclinicav1:', datos);

    await Nutricion.insertarHistoriaClinicaV1(datos);

    res.json({ success: true });
  } catch (error) {
    console.error('Error guardando datos de historiaclinicav1:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
};
