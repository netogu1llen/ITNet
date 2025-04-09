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

  /**
   * Obtiene los datos de un paciente por su ID de expediente.
   * @param {number} idExpediente
   * @returns {Object[]}
   */
  static async getPaciente(idExpediente) {
    try {
      console.log(idExpediente);
      // Usamos el método de promesas para la consulta
      const result = await db.execute(
        'SELECT nombres, apellidoP, apellidoM, numExpediente, fechaNacimiento, contacto, direccion, enfermedades, medicamentos, estudioSocioeconomico, grado, curso, sangre FROM expediente WHERE IDExpediente = ?;',
        [idExpediente]
      );
      return result || [];
    } catch (error) {
      console.error('Error al obtener paciente:', error);
      throw new Error('Error al obtener paciente');
    }
  }

  /**
   * Actualiza los datos de un paciente en la base de datos.
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
   * @param {number} datosPaciente.idExpediente
   */
  static async editarPaciente({
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
  }) {
    try {
      // Usamos el método de promesas para la consulta
      const [result] = await db.execute(
        'UPDATE expediente SET nombres = ?, apellidoP = ?, apellidoM = ?, numExpediente = ?, fechaNacimiento = ?, contacto = ?, direccion = ?, enfermedades = ?, medicamentos = ?, estudioSocioeconomico = ?, grado = ?, curso = ?, sangre = ? WHERE IDExpediente = ?',
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
          sangre,
          idExpediente
        ]
      );
    } catch (error) {
      console.error('Error al actualizar paciente:', error);
      throw new Error('Error al actualizar paciente');
    }
  }
}

module.exports = Pacientes;
