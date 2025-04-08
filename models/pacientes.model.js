const db = require('../util/database');

class Pacientes {
  /**
   * Registra un nuevo paciente en la base de datos.
   * @param {Object} datosPaciente
   * @param {string} datosPaciente.nombres
   * @param {string} datosPaciente.apellidoP
   * @param {string} datosPaciente.apellidoM
   * @param {string} datosPaciente.numExpediente
   * @param {string} datosPaciente.fechaNacimiento
   * @param {string} datosPaciente.contacto
   * @param {string} datosPaciente.direccion
   * @param {string} datosPaciente.enfermedades
   * @param {string} datosPaciente.medicamentos
   * @param {string} datosPaciente.estudioSocioeconomico
   * @param {string} datosPaciente.grado
   * @param {string} datosPaciente.curso
   * @param {string} datosPaciente.sangre
   */
  static async registrarPaciente({
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
  }) {
    try {
      await db.execute(
        `INSERT INTO expediente SET
          nombres = ?, apellidoP = ?, apellidoM = ?, numExpediente = ?,
          fechaNacimiento = ?, contacto = ?, direccion = ?,
          enfermedades = ?, medicamentos = ?, estudioSocioeconomico = ?,
          grado = ?, curso = ?, sangre = ?, eliminado = 0`,
        [
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
        ]
      );
    } catch (error) {
      console.error('Error al registrar paciente:', error);
      throw new Error('Error al registrar paciente');
    }
  }
}

module.exports = Pacientes;
