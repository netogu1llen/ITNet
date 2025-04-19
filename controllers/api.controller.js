// Importa el modelo de pacientes y funciones de encriptación
const Pacientes = require('../models/pacientes.model');
const { decrypt } = require('../util/encryptData');

/**
 * Controlador para obtener todos los pacientes.
 * 
 * Este método:
 * 1. Consulta los pacientes desde la base de datos.
 * 2. Desencripta campos sensibles como nombres y fecha de nacimiento.
 * 3. Maneja errores en desencriptación individual por campo.
 * 4. Renderiza la vista con los datos procesados.
 *
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 * @return {void}
 */
const getPacientes = async (req, res) => {
  try {
    // Recupera todos los pacientes del modelo
    const pacientes = await Pacientes.obtenerTodos();

    // Mapea y desencripta los datos sensibles para cada paciente
    const pacientesDesencriptados = pacientes.map(paciente => {
      try {
        // Verifica que los campos esenciales existan antes de desencriptar
        if (!paciente.nombres || !paciente.apellidoP || !paciente.apellidoM || !paciente.fechaNacimiento) {
          return {
            IDExpediente: paciente.IDExpediente,
            nombreCompleto: '[Datos incompletos]',
            fechaNacimiento: '[Fecha no disponible]',
            nvEscolar: paciente.nvEscolar || 'Sin nivel registrado'
          };
        }

        // Intenta desencriptar cada campo individualmente con manejo de errores
        let nombres, apellidoP, apellidoM, fechaNacimiento;

        try {
          nombres = decrypt(paciente.nombres);
        } catch (e) {
          nombres = '[Error]';
          console.error(`Error al desencriptar nombre: ${e.message}`);
        }

        try {
          apellidoP = decrypt(paciente.apellidoP);
        } catch (e) {
          apellidoP = '[Error]';
          console.error(`Error al desencriptar apellido paterno: ${e.message}`);
        }

        try {
          apellidoM = decrypt(paciente.apellidoM);
        } catch (e) {
          apellidoM = '[Error]';
          console.error(`Error al desencriptar apellido materno: ${e.message}`);
        }

        try {
          fechaNacimiento = decrypt(paciente.fechaNacimiento);
        } catch (e) {
          fechaNacimiento = '[Error]';
          console.error(`Error al desencriptar fecha: ${e.message}`);
        }

        // Retorna el objeto paciente con campos desencriptados o valores alternativos
        return {
          IDExpediente: paciente.IDExpediente,
          nombreCompleto: `${nombres} ${apellidoP} ${apellidoM}`.trim(),
          fechaNacimiento: fechaNacimiento,
          nvEscolar: paciente.nvEscolar || 'Sin nivel registrado'
        };
      } catch (error) {
        console.error(`Error al desencriptar paciente ID ${paciente.IDExpediente}:`, error);
        // Si hay un error crítico, retorna datos genéricos para ese paciente
        return {
          IDExpediente: paciente.IDExpediente,
          nombreCompleto: '[Error en datos]',
          fechaNacimiento: '[Error en fecha]',
          nvEscolar: paciente.nvEscolar || 'Sin nivel registrado'
        };
      }
    });

    // Envía la lista de pacientes como respuesta JSON
    res.status(200).json({
        success: true,
        results: pacientesDesencriptados
      });
  } catch (error) {
    // Maneja errores generales de acceso a datos
    console.error('Error al obtener la información:', error.message);
    res.status(500).send('Error al obtener la información');
  }
};

// Exporta el controlador
module.exports = { getPacientes };