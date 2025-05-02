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
    IDExpediente, // Nuevo parámetro
    nombres,
    apellidoP,
    apellidoM,
    fechaNacimiento,
    contacto,
    nombreContacto,
    apellidoPContacto,
    apellidoMContacto,
    parentescoContacto,
    estado,
    ciudad,
    calle,
    cp,
    localidad,
    numCasa,
    enfermedades,
    medicamentos,
    estudioSocioeconomico,
    grado,
    nvEscolar,
    sangre,
    sexo
  })
  {
    try {
      // Verificar que el IDExpediente no exista ya
      const [existente] = await db.execute(
        'SELECT IDExpediente FROM expediente WHERE IDExpediente = ?',
        [IDExpediente]
      );
      
      if (existente && existente.length > 0) {
        throw new Error(`El ID de expediente ${IDExpediente} ya existe en la base de datos.`);
      }
      
      const [result] = await db.execute(
        `INSERT INTO expediente (
          IDExpediente, nombres, apellidoP, apellidoM,
          fechaNacimiento, contacto, 
          nombreContacto, apellidoPContacto, apellidoMContacto, parentescoContacto,
          estado, ciudad, calle, cp, localidad, numCasa,
          enfermedades, medicamentos, estudioSocioeconomico,
          grado, nvEscolar, sangre, eliminado, sexo
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?
        )`,
        [
          IDExpediente,
          nombres,
          apellidoP,
          apellidoM,
          fechaNacimiento,
          contacto,
          nombreContacto || null,
          apellidoPContacto || null,
          apellidoMContacto || null,
          parentescoContacto || null,
          estado,
          ciudad,
          calle,
          cp,
          localidad,
          numCasa,
          enfermedades,
          medicamentos,
          estudioSocioeconomico,
          grado,
          nvEscolar,
          sangre,
          sexo
        ]
      );
      return { ...result, insertId: IDExpediente };
    } catch (error) {
      console.error('Error al registrar paciente:', error);
      throw error; // Propagamos el error con el mensaje exacto
    }
  }
  /**
   * Obtiene los datos de un paciente por su ID de expediente.
   * @param {number} idExpediente
   * @returns {Object[]}
   */
  static async getPaciente(idExpediente) {
    try {
      const [result] = await db.execute(
        `SELECT IDExpediente, nombres, apellidoP, apellidoM,
          fechaNacimiento, contacto, 
          nombreContacto, apellidoPContacto, apellidoMContacto, parentescoContacto,
          estado, ciudad, calle, cp, localidad, numCasa, enfermedades,
          medicamentos, estudioSocioeconomico, grado, nvEscolar, sangre, sexo
         FROM expediente
         WHERE IDExpediente = ? AND eliminado = 0`,
        [idExpediente]
      );
      return result[0]; 
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
    nombreContacto,
    apellidoPContacto,
    apellidoMContacto,
    parentescoContacto,
    estado,
    ciudad,
    calle,
    cp,
    localidad,
    numCasa,
    enfermedades,
    medicamentos,
    estudioSocioeconomico,
    grado,
    nvEscolar,
    sangre,
    sexo,
    IDExpediente, // Nuevo parámetro para actualizar el ID
    idExpediente
  }) {
    try {
      console.log('editarPaciente - Valores recibidos:', { 
        nuevoID: IDExpediente, 
        idActual: idExpediente, 
        sonIguales: IDExpediente == idExpediente
      });
      
      // Si el ID ha cambiado, actualizamos el registro con el nuevo ID
      if (IDExpediente != idExpediente) {
        console.log('Intentando actualizar IDExpediente de', idExpediente, 'a', IDExpediente);
        
        try {
          // Primero verificamos si existen documentos u otras relaciones con este expediente
          const [documentos] = await db.execute(
            `SELECT COUNT(*) as count FROM documentosAdjuntos WHERE IDExpediente = ?`,
            [idExpediente]
          );
          
          const tieneDocumentos = documentos[0].count > 0;
          console.log('El expediente tiene documentos asociados:', tieneDocumentos ? 'Sí' : 'No', `(${documentos[0].count})`);
          
          if (tieneDocumentos) {
            // Si hay documentos, primero actualizamos las referencias en la tabla de documentos
            console.log('Actualizando referencias en documentosAdjuntos...');
            const [updateDocsResult] = await db.execute(
              `UPDATE documentosAdjuntos SET IDExpediente = ? WHERE IDExpediente = ?`,
              [IDExpediente, idExpediente]
            );
            console.log('Resultado de actualización de documentos:', updateDocsResult);
          }
          
          // Ahora actualizamos el expediente
          console.log('Actualizando expediente principal...');
          const [result] = await db.execute(
            `UPDATE expediente SET
              nombres = ?, apellidoP = ?, apellidoM = ?,
              fechaNacimiento = ?, contacto = ?, 
              nombreContacto = ?, apellidoPContacto = ?, apellidoMContacto = ?, parentescoContacto = ?,
              estado = ?, ciudad = ?,
              calle = ?, cp = ?, localidad = ?, numCasa = ?,
              enfermedades = ?, medicamentos = ?, estudioSocioeconomico = ?,
              grado = ?, nvEscolar = ?, sangre = ?, sexo = ?,
              IDExpediente = ?
            WHERE IDExpediente = ?`,
            [
              nombres,
              apellidoP,
              apellidoM,
              fechaNacimiento,
              contacto,
              nombreContacto || null,
              apellidoPContacto || null,
              apellidoMContacto || null,
              parentescoContacto || null,
              estado,
              ciudad,
              calle,
              cp,
              localidad,
              numCasa,
              enfermedades,
              medicamentos,
              estudioSocioeconomico,
              grado,
              nvEscolar,
              sangre,
              sexo,
              IDExpediente,
              idExpediente
            ]
          );
          console.log('Resultado de actualización de expediente:', result);
          
          // Verificar si se actualizó correctamente
          if (result.affectedRows === 0) {
            console.warn('No se actualizó ninguna fila en la tabla expediente');
          }
          
          return result;
        } catch (updateError) {
          console.error('Error específico al actualizar ID:', updateError);
          // Propagar el error con un mensaje más descriptivo
          throw new Error(`Error al actualizar ID de expediente: ${updateError.message}`);
        }
      } else {
        // Si el ID no ha cambiado, solo actualizamos el resto de los datos
        console.log('El ID no ha cambiado, actualizando solo los demás campos');
        const [result] = await db.execute(
          `UPDATE expediente SET
            nombres = ?, apellidoP = ?, apellidoM = ?,
            fechaNacimiento = ?, contacto = ?, 
            nombreContacto = ?, apellidoPContacto = ?, apellidoMContacto = ?, parentescoContacto = ?,
            estado = ?, ciudad = ?,
            calle = ?, cp = ?, localidad = ?, numCasa = ?,
            enfermedades = ?, medicamentos = ?, estudioSocioeconomico = ?,
            grado = ?, nvEscolar = ?, sangre = ?, sexo = ?
          WHERE IDExpediente = ?`,
          [
            nombres,
            apellidoP,
            apellidoM,
            fechaNacimiento,
            contacto,
            nombreContacto || null,
            apellidoPContacto || null,
            apellidoMContacto || null,
            parentescoContacto || null,
            estado,
            ciudad,
            calle,
            cp,
            localidad,
            numCasa,
            enfermedades,
            medicamentos,
            estudioSocioeconomico,
            grado,
            nvEscolar,
            sangre,
            sexo,
            idExpediente
          ]
        );
        return result;
      }
    } catch (error) {
      console.error('Error general al actualizar paciente:', error);
      throw error; // Propagar el error original para mejor diagnóstico
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
                IDExpediente,
                nombres, apellidoP, apellidoM,
                fechaNacimiento, 
                contacto, 
                CONCAT(estado, ', ', ciudad) AS ubicacion, 
                CONCAT(calle, ' ', numCasa) AS domicilio,
                grado, 
                nvEscolar AS curso,
                sexo
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
            AND (ubicacion LIKE 'general/%' OR ubicacion LIKE '%/general/%' OR ubicacion NOT LIKE '%/psicologia/%' AND ubicacion NOT LIKE '%/nutricion/%')
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
            ue.fecha AS fechaCreacion
          FROM expediente e
          LEFT JOIN usuarioExpediente ue ON e.IDExpediente = ue.IDExpediente AND ue.numSesion = 1
          LEFT JOIN usuario uCreador ON ue.IDUsuario = uCreador.IDUsuario
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

