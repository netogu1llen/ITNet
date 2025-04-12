const db = require('../util/database');


class Pacientes {
  /**
   * Registra un nuevo paciente en la base de datos.
   * @param {Object} datosPaciente
   * @param {string} datosPaciente.nombres
   * @param {string} datosPaciente.apellidoP
   * @param {string} datosPaciente.apellidoM
   * @param {string} datosPaciente.fechaNacimiento
   * @param {string} datosPaciente.contacto
   * @param {string} datosPaciente.estado
   * @param {string} datosPaciente.ciudad
   * @param {string} datosPaciente.calle
   * @param {string} datosPaciente.cp
   * @param {string} datosPaciente.localidad
   * @param {string} datosPaciente.numCasa
   * @param {string} datosPaciente.numExpediente
   * @param {string} datosPaciente.enfermedades
   * @param {string} datosPaciente.medicamentos
   * @param {string} datosPaciente.estudioSocioeconomico
   * @param {string} datosPaciente.grado
   * @param {string} datosPaciente.nvEscolar
   * @param {string} datosPaciente.sangre
   */
  static async registrarPaciente({
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
  })
  {
    try {
      await db.execute(
        `INSERT INTO expediente SET
          nombres = ?, apellidoP = ?, apellidoM = ?,
          fechaNacimiento = ?, contacto = ?, estado = ?,  ciudad = ?,
          calle = ?,  cp = ?,  localidad = ?,  numCasa = ?, numExpediente = ?,
          enfermedades = ?, medicamentos = ?, estudioSocioeconomico = ?,
          grado = ?, nvEscolar = ?, sangre = ?, eliminado = 0`,
        [
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
      // Usamos el método de promesas para la consulta
      const [result] = await db.execute(
        `SELECT nombres, apellidoP, apellidoM, numExpediente,
          fechaNacimiento, contacto, estado,  ciudad,
          calle,  cp,  localidad,  numCasa, enfermedades,
          medicamentos, estudioSocioeconomico, grado, nvEscolar, sangre
         FROM expediente
         WHERE IDExpediente = ?`,
        [idExpediente]
      );
      return result[0] || [];
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
   * @param {string} datosPaciente.fechaNacimiento
   * @param {string} datosPaciente.contacto
   * @param {string} datosPaciente.estado
   * @param {string} datosPaciente.ciudad
   * @param {string} datosPaciente.calle
   * @param {string} datosPaciente.cp
   * @param {string} datosPaciente.localidad
   * @param {string} datosPaciente.numCasa
   * @param {string} datosPaciente.numExpediente
   * @param {string} datosPaciente.enfermedades
   * @param {string} datosPaciente.medicamentos
   * @param {string} datosPaciente.estudioSocioeconomico
   * @param {string} datosPaciente.grado
   * @param {string} datosPaciente.nvEscolar
   * @param {string} datosPaciente.sangre
   * @param {number} datosPaciente.idExpediente
   */
  static async editarPaciente({
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
    sangre,
    idExpediente
  }) {
    try {
      // Usamos el método de promesas para la consulta
      const [result] = await db.execute(
        `UPDATE expediente SET
          nombres = ?, apellidoP = ?, apellidoM = ?,
           fechaNacimiento = ?, contacto = ?, estado = ?,  ciudad = ?,
           calle = ?,  cp = ?,  localidad = ?,  numCasa = ?, numExpediente = ?,
           enfermedades = ?, medicamentos = ?, estudioSocioeconomico = ?,
           grado = ?, nvEscolar = ?, sangre = ?
         WHERE IDExpediente = ?`,
         [
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
          sangre,
          idExpediente
        ]
      );
    } catch (error) {
      console.error('Error al actualizar paciente:', error);
      throw new Error('Error al actualizar paciente');
    }
  }
  static async eliminarPaciente(idExpediente) {
    try {
        // Usamos el método de promesas para la consulta
        await db.execute(
            'UPDATE expediente SET eliminado = 1 WHERE IDExpediente= ?',
            [idExpediente]
        );
    } catch (error) {
        console.error('Error al registrar seguimiento:', error);
        throw new Error('Error al actualizar seguimiento');
    }
  }
}


module.exports = Pacientes;

