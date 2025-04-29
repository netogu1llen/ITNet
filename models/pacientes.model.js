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
      const [result] = await db.execute(
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
      return result;
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
      return result; 
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

  // Obtener todos los pacientes (excluyendo los eliminados)
  static async obtenerTodos() {
    try {
        const [results] = await db.execute(`
            SELECT IDExpediente, nombres, apellidoP, apellidoM, fechaNacimiento, nvEscolar
            FROM expediente
            WHERE eliminado IS NULL OR eliminado = 0
        `);
        return results;
    } catch (error) {
        throw error;
    }
  }

  // Obtener expediente por ID con formato para vista
  static async obtenerExpedientePorId(idExpediente) {
    try {
        const [results] = await db.execute(`
            SELECT 
                nombres, apellidoP, apellidoM,
                fechaNacimiento, 
                contacto, 
                CONCAT(estado, ', ', ciudad) AS ubicacion, 
                CONCAT(calle, ' ', numCasa) AS domicilio,
                grado, 
                nvEscolar AS curso,
                numExpediente
            FROM expediente
            WHERE IDExpediente = ? AND eliminado = 0
        `, [idExpediente]);
        return results[0]; // Devuelve el primer resultado
    } catch (error) {
        throw error;
    }
  }

  // Obtener documentos adjuntos de un expediente
  static async obtenerDocumentosAdjuntos(idExpediente) {
    try {
        const [results] = await db.execute(`
            SELECT IDDocumento AS idDocumento, IDExpediente AS idExpediente, nombre AS tipo, fecha AS fechaCreacion
            FROM documentosAdjuntos
            WHERE IDExpediente = ? AND eliminado = 0
        `, [idExpediente]);
        return results;
    } catch (error) {
        throw error;    
    }
  }

  // Registrar un nuevo documento
  static async registrarDocumento({ idExpediente, tipo, fechaCreacion, nombreArchivo }) {
    try {
        const [result] = await db.execute(`
            INSERT INTO documentosAdjuntos (IDExpediente, nombre, fecha, ubicacion)
            VALUES (?, ?, ?, ?)
        `, [idExpediente, tipo, fechaCreacion, nombreArchivo]);
        return result;
    } catch (error) {
        throw error;
    }
  }

  // Obtener un documento por ID
  static async obtenerDocumentoPorId(id) {
    try {
        const [results] = await db.execute(`
            SELECT IDDocumento AS idDocumento, IDExpediente, nombre AS tipo, fecha AS fechaCreacion, ubicacion AS nombreArchivo
            FROM documentosAdjuntos
            WHERE IDDocumento = ?
        `, [id]);
        return results[0];
    } catch (error) {
        throw error;
    }
  }

  // Eliminar un documento (borrado lógico)
  static async eliminarDocumento(id) {
    try {
        const [result] = await db.execute(`
            UPDATE documentosAdjuntos
            SET eliminado = 1
            WHERE IDDocumento = ?
        `, [id]);
        return result;
    } catch (error) {
        throw error;
    }
  }

  // Subir un documento a la base de datos
  static async subirDocumento({ IDExpediente, nombre, ubicacion, fecha, eliminado }) {
    try {
        console.log('Insertando documento en BD:', { IDExpediente, nombre, ubicacion, fecha, eliminado });
        
        const [result] = await db.execute(
            `INSERT INTO documentosAdjuntos (IDExpediente, nombre, ubicacion, fecha, eliminado)
            VALUES (?, ?, ?, ?, ?)`,
            [IDExpediente, nombre, ubicacion, fecha, eliminado]
        );
        return result;
    } catch (error) {
        throw error;
    }
  }
    // Obtener historial de expedientes con creador y modificador
  static async obtenerHistorialExpedientes() {
    try {
      const [results] = await db.execute(`
        SELECT 
          e.IDExpediente,
          e.nombres AS nombrePaciente,
          uCreador.nombres AS creadoPor,
          ue.fecha AS fechaCreacion,
          uMod.nombres AS modificadoPor,
          e.fechaModificacion
        FROM expediente e
        LEFT JOIN usuarioExpediente ue ON e.IDExpediente = ue.IDExpediente AND ue.numSesion = 1
        LEFT JOIN usuario uCreador ON ue.IDUsuario = uCreador.IDUsuario
        LEFT JOIN usuario uMod ON e.modificadoPor = uMod.IDUsuario
        WHERE e.eliminado IS NULL OR e.eliminado = 0;
      `);
      return results;
    } catch (error) {
      console.error('Error al obtener historial de expedientes:', error);
      throw new Error('Error al obtener historial de expedientes');
    }
  }
    
}



module.exports = Pacientes;

