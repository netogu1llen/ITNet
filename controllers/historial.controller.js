const { decrypt } = require('../util/encryptData');
const Pacientes = require('../models/pacientes.model');

// Mostrar historial de expedientes
const getHistorialExpedientes = async (req, res) => {
  try {
    const historial = await Pacientes.obtenerHistorialExpedientes();

    const historialDesencriptado = historial.map(expediente => {
      let nombrePaciente = '[Paciente no disponible]';

      try {
        if (expediente.nombrePaciente) {
          nombrePaciente = decrypt(expediente.nombrePaciente);
        }
      } catch (error) {
        console.error(`Error al desencriptar nombre de paciente ID ${expediente.IDExpediente}:`, error.message);
      }

      return {
        IDExpediente: expediente.IDExpediente,
        nombrePaciente: nombrePaciente,
        creadoPor: expediente.creadoPor || 'No registrado',
        fechaCreacion: expediente.fechaCreacion || null,
        modificadoPor: expediente.modificadoPor || 'No modificado',
        fechaModificacion: expediente.fechaModificacion || null
      };
    });

    res.render('historialExpedientes', { historial: historialDesencriptado });

  } catch (error) {
    console.error('Error al obtener historial:', error.message);
    res.status(500).send('Error al obtener historial de expedientes');
  }
};

module.exports = {
  getHistorialExpedientes
};
