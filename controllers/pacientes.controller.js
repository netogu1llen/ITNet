const Pacientes = require('../models/pacientes.model');
const { encrypt, decrypt } = require('../util/encryptData');
const db = require('../util/database'); 
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const s3 = require('../util/s3Client');

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
    
    res.render('pacientes', { pacientes: pacientesDesencriptados, user: req.user });
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
    res.render('registrarPaciente', {user: req.user});
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
      IDExpediente, // Nuevo campo
      nombres,
      apellidoP,
      apellidoM,
      fechaNacimiento,
      contacto,
      nombreContacto,     // Nuevo campo
      apellidoPContacto,  // Nuevo campo
      apellidoMContacto,  // Nuevo campo
      parentescoContacto, // Nuevo campo
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
    } = req.body;

    // Validar que IDExpediente sea un número válido
    const expedienteID = parseInt(IDExpediente, 10);
    if (isNaN(expedienteID) || expedienteID <= 0) {
      return res.status(400).json({ 
        mensaje: 'El ID de expediente debe ser un número entero positivo.' 
      });
    }

    // Encriptar los campos sensibles
    const pacienteEncriptado = {
      IDExpediente: expedienteID, // Usar el ID proporcionado
      nombres: encrypt(nombres).encryptedData,
      apellidoP: encrypt(apellidoP).encryptedData,
      apellidoM: encrypt(apellidoM).encryptedData,
      fechaNacimiento: encrypt(fechaNacimiento).encryptedData,
      contacto: encrypt(contacto).encryptedData,
      nombreContacto: nombreContacto ? encrypt(nombreContacto).encryptedData : null,
      apellidoPContacto: apellidoPContacto ? encrypt(apellidoPContacto).encryptedData : null,
      apellidoMContacto: apellidoMContacto ? encrypt(apellidoMContacto).encryptedData : null,
      parentescoContacto: parentescoContacto ? encrypt(parentescoContacto).encryptedData : null,
      estado: encrypt(estado).encryptedData,
      ciudad: encrypt(ciudad).encryptedData,
      calle: encrypt(calle).encryptedData,
      cp: encrypt(cp).encryptedData,
      localidad: encrypt(localidad).encryptedData,
      numCasa: encrypt(numCasa).encryptedData,
      enfermedades,
      medicamentos,
      estudioSocioeconomico,
      grado,
      nvEscolar,
      sangre,
      sexo
    };

    try {
      const result = await Pacientes.registrarPaciente(pacienteEncriptado);
      res.status(200).json({ mensaje: 'Datos registrados correctamente' });
    } catch (dbError) {
      // Manejar error específico de ID duplicado
      if (dbError.message.includes('ya existe')) {
        return res.status(400).json({
          mensaje: dbError.message
        });
      }
      throw dbError; // Propagar otros errores
    }
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
    console.log("El id del expediente es: ", idExpediente)
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
    
    // Desencriptar datos de contacto de emergencia
    if (paciente.nombreContacto) {
      paciente.nombreContacto = decrypt(paciente.nombreContacto);
    }
    if (paciente.apellidoPContacto) {
      paciente.apellidoPContacto = decrypt(paciente.apellidoPContacto);
    }
    if (paciente.apellidoMContacto) {
      paciente.apellidoMContacto = decrypt(paciente.apellidoMContacto);
    }
    if (paciente.parentescoContacto) {
      paciente.parentescoContacto = decrypt(paciente.parentescoContacto);
    }
    
    paciente.sexo = paciente.sexo ? paciente.sexo : "";
    console.log(paciente);

    res.render('editarPaciente', { datos: paciente, user: req.user});
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
      IDExpediente,
      enfermedades,
      medicamentos,
      estudioSocioeconomico,
      grado,
      nvEscolar,
      sangre,
      sexo
    } = req.body;
    // Validar que IDExpediente sea un número válido
    const nuevoIdExpediente = parseInt(IDExpediente, 10);
    if (isNaN(nuevoIdExpediente) || nuevoIdExpediente <= 0) {
      return res.status(400).json({ 
        mensaje: 'El número de expediente debe ser un número entero positivo.' 
      });
    }
    
    console.log('Datos de edición recibidos:', {
      idOriginal: idExpediente,
      nuevoId: nuevoIdExpediente,
      idHaCambiado: nuevoIdExpediente != idExpediente
    });

    // Verificar si el nuevo ID ya existe, pero no es el mismo que ya tenía
    if (nuevoIdExpediente != idExpediente) {
      console.log('El ID ha cambiado, verificando si el nuevo ID ya existe...');
      const [existente] = await db.execute(
        'SELECT IDExpediente FROM expediente WHERE IDExpediente = ? AND eliminado = 0',
        [nuevoIdExpediente]
      );
      
      if (existente && existente.length > 0) {
        return res.status(400).json({
          mensaje: `El número de expediente ${nuevoIdExpediente} ya existe en la base de datos. Por favor elija otro número.`
        });
      }
      
      console.log('El nuevo ID no existe, procediendo con la actualización');
    }

    const pacienteEncriptado = {
      nombres: encrypt(nombres).encryptedData,
      apellidoP: encrypt(apellidoP).encryptedData,
      apellidoM: encrypt(apellidoM).encryptedData,
      fechaNacimiento: encrypt(fechaNacimiento).encryptedData,
      contacto: encrypt(contacto).encryptedData,
      nombreContacto: nombreContacto ? encrypt(nombreContacto).encryptedData : null,
      apellidoPContacto: apellidoPContacto ? encrypt(apellidoPContacto).encryptedData : null,
      apellidoMContacto: apellidoMContacto ? encrypt(apellidoMContacto).encryptedData : null,
      parentescoContacto: parentescoContacto ? encrypt(parentescoContacto).encryptedData : null,
      estado: encrypt(estado).encryptedData,
      ciudad: encrypt(ciudad).encryptedData,
      calle: encrypt(calle).encryptedData,
      cp: encrypt(cp).encryptedData,
      localidad: encrypt(localidad).encryptedData,
      numCasa: encrypt(numCasa).encryptedData,
      IDExpediente: nuevoIdExpediente,
      enfermedades,
      medicamentos,
      estudioSocioeconomico,
      grado,
      nvEscolar,
      sangre,
      sexo,
      idExpediente // ID original para la cláusula WHERE
    };

    try {
      const resultado = await Pacientes.editarPaciente(pacienteEncriptado);
      console.log('Resultado de la actualización:', resultado);
      
      // Verificar si realmente se actualizó algo
      if (resultado.affectedRows === 0) {
        console.warn('No se actualizó ninguna fila');
        return res.status(404).json({
          mensaje: 'No se encontró el expediente o no se realizaron cambios.'
        });
      }
      
      res.status(200).json({ 
        mensaje: 'Datos actualizados correctamente',
        detalles: nuevoIdExpediente != idExpediente ? 
          `Se cambió el número de expediente de ${idExpediente} a ${nuevoIdExpediente}` : 
          'Se actualizaron los datos sin cambiar el número de expediente'
      });
    } catch (dbError) {
      console.error('Error específico de la base de datos:', dbError);
      
      // Detectar errores relacionados con claves foráneas
      if (dbError.message.includes('foreign key constraint') || 
          dbError.code === 'ER_ROW_IS_REFERENCED' || 
          dbError.code === 'ER_NO_REFERENCED_ROW') {
        return res.status(400).json({
          mensaje: 'No se puede cambiar el número de expediente porque está siendo usado en otros registros.',
          error: dbError.message
        });
      }
      
      throw dbError; // Propagar otros errores
    }

  } catch (error) {
    console.error('Error general al actualizar paciente:', error.message, error.stack);
    res.status(500).json({
      mensaje: 'Error al actualizar. Por favor, intenta nuevamente más tarde.',
      detalles: process.env.NODE_ENV === 'development' ? error.message : undefined
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

// Función helper para desencriptar expediente con manejo de errores
const desencriptarExpediente = (expediente) => {
  if (!expediente) return expediente;
  
  try {
      // Desencriptar datos individuales
      let nombres = '';
      let apellidoP = '';
      let apellidoM = '';
      
      // Desencriptar nombres
      if (expediente.nombres) {
          nombres = decrypt(expediente.nombres);
      }
      
      // Desencriptar apellido paterno
      if (expediente.apellidoP) {
          apellidoP = decrypt(expediente.apellidoP);
      }
      
      // Desencriptar apellido materno
      if (expediente.apellidoM) {
          apellidoM = decrypt(expediente.apellidoM);
      }
      
      // Crear nombre completo con los valores desencriptados
      expediente.nombreCompleto = `${nombres} ${apellidoP} ${apellidoM}`.trim();
      
      // Desencriptar fecha de nacimiento
      if (expediente.fechaNacimiento) {
          expediente.fechaNacimiento = decrypt(expediente.fechaNacimiento);
      }
      
      // Desencriptar contacto
      if (expediente.contacto) {
          expediente.contacto = decrypt(expediente.contacto);
      }
      
      // Desencriptar ubicación si existe
      if (expediente.ubicacion) {
          expediente.ubicacion = decrypt(expediente.ubicacion);
      }
      
      // Desencriptar domicilio si existe
      if (expediente.domicilio) {
          expediente.domicilio = decrypt(expediente.domicilio);
      }
      
      // Desencriptar datos de contacto de emergencia
      let nombreContacto = '';
      let apellidoPContacto = '';
      let apellidoMContacto = '';
      
      if (expediente.nombreContacto) {
          nombreContacto = decrypt(expediente.nombreContacto);
      }
      
      if (expediente.apellidoPContacto) {
          apellidoPContacto = decrypt(expediente.apellidoPContacto);
      }
      
      if (expediente.apellidoMContacto) {
          apellidoMContacto = decrypt(expediente.apellidoMContacto);
      }
      
      // Crear nombre completo del contacto de emergencia
      if (nombreContacto || apellidoPContacto || apellidoMContacto) {
          expediente.nombreContactoEmergencia = `${nombreContacto} ${apellidoPContacto} ${apellidoMContacto}`.trim();
      }
      
      // Desencriptar parentesco de contacto
      if (expediente.parentescoContacto) {
          expediente.parentescoContacto = decrypt(expediente.parentescoContacto);
      }
      
      return expediente;
  } catch (error) {
      console.error('Error al desencriptar datos del expediente:', error);
      return expediente; // Devolver el expediente original si hay error
  }
};

// Obtener expediente completo con documentos
const obtenerExpediente = async (req, res) => {
  try {
      const { idExpediente } = req.params;
      
      // Obtener datos del expediente y desencriptar
      let expediente = await Pacientes.obtenerExpedientePorId(idExpediente);
      
      // Verificar si se encontró el expediente
      if (!expediente) {
          console.error(`No se encontró el expediente con ID ${idExpediente}`);
          return res.status(404).render('error', { 
              message: 'Expediente no encontrado', 
              error: { 
                  status: 404, 
                  stack: `El expediente con ID ${idExpediente} no existe o fue eliminado.` 
              } 
          });
      }
      
      // Continuar si el expediente existe
      expediente = desencriptarExpediente(expediente);
      
      // Obtener documentos
      const documentosAdjuntos = await Pacientes.obtenerDocumentosAdjuntos(idExpediente);
      const documentos = [...documentosAdjuntos];

      // Renderizar la vista con los datos
      res.render('expediente',  {
          expediente,
          documentos,
          user: req.user
      });
  } catch (error) {
      console.error('Error al obtener expediente:', error);
      res.status(500).render('error', { 
          message: 'Error al cargar el expediente', 
          error: { 
              status: 500, 
              stack: process.env.NODE_ENV === 'development' ? error.stack : '' 
          } 
      });
  }
};

// Obtener documentos de un expediente
const obtenerDocumentosPorExpediente = async (req, res) => {
  try {
      const { idExpediente } = req.params;

      // Obtener documentos
      const documentosAdjuntos = await Pacientes.obtenerDocumentosAdjuntos(idExpediente);
      const documentos = [...documentosAdjuntos];

      // Obtener datos del expediente y desencriptar
      let expediente = await Pacientes.obtenerExpedientePorId(idExpediente);
      expediente = desencriptarExpediente(expediente);

      // Renderizar la vista con los datos
      res.render('expediente', {
          expediente,
          documentos,
          user: req.user
      });
  } catch (error) {
      console.error('Error al obtener documentos:', error);
      res.status(500).json({ error: 'Error al obtener documentos' });
  }
};

const upload = multer({ storage: multer.memoryStorage() });


// Middleware para subir múltiples documentos
const subirMultiplesDocumentos = [
  upload.array('archivosDocumento'), 
  async (req, res) => {
    try {
      const { IDExpediente } = req.params;
      console.log('Iniciando subida de múltiples documentos. ID expediente:', IDExpediente);
      
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'Debe subir al menos un archivo PDF válido' });
      }
      
      console.log('Archivos recibidos:', req.files.length);
      
      // Obtener datos del paciente para crear la carpeta
      const paciente = await Pacientes.getPaciente(IDExpediente);
      
      if (!paciente) {
        return res.status(404).json({ error: 'Expediente no encontrado' });
      }
      
      // Desencriptar nombres con manejo de errores
      let nombres, apellidoP, apellidoM;
      try {
        nombres = decrypt(paciente.nombres);
        apellidoP = decrypt(paciente.apellidoP);
        apellidoM = decrypt(paciente.apellidoM);
      } catch (decryptError) {
        console.error('Error al desencriptar datos:', decryptError);
        nombres = `paciente_${IDExpediente}`;
        apellidoP = 'apellido';
        apellidoM = '';
      }
      
      // Crear nombre de carpeta normalizado
      const nombreCarpeta = `${apellidoP}_${apellidoM}_${nombres}`
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '_');
      
      console.log('Nombre de carpeta generado:', nombreCarpeta);
      
      // Procesar y subir cada archivo
      const resultados = [];
      
      for (const archivo of req.files) {
        try {
          console.log('Procesando archivo:', archivo.originalname);
          
          // Verificar que sea PDF
          if (archivo.mimetype !== 'application/pdf') {
            console.log('Archivo ignorado - no es PDF:', archivo.originalname);
            continue;
          }
          
          // Verificar buffer
          if (!archivo.buffer || archivo.buffer.length === 0) {
            console.error(`Error: El archivo ${archivo.originalname} no tiene un buffer válido`);
            continue;
          }
          
          console.log(`Tamaño del buffer: ${archivo.buffer.length} bytes`);
          
          // Obtener nombre original del archivo sin extensión
          const nombreOriginal = path.basename(archivo.originalname, '.pdf');
          
          // Crear ruta para S3
          const fileKey = `general/${nombreCarpeta}/${Date.now()}_${nombreOriginal.replace(/[^a-z0-9]/gi, '_')}.pdf`;
          
          // Subir a S3
          const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: fileKey,
            Body: archivo.buffer,
            ContentType: 'application/pdf',
          };
          
          await s3.upload(params).promise();
          console.log('Archivo subido a S3 exitosamente');
          
          // Guardar en base de datos - incluir nombre original para descarga
          const nuevoDocumento = await Pacientes.subirDocumento({
            IDExpediente,
            nombre: nombreOriginal, // Guardar el nombre original
            ubicacion: fileKey,
            fecha: new Date(),
            eliminado: 0
          });
          
          resultados.push({
            nombre: nombreOriginal,
            documento: nuevoDocumento
          });
        } catch (fileError) {
          console.error(`Error al procesar archivo ${archivo.originalname}:`, fileError);
        }
      }
      
      if (resultados.length === 0) {
        return res.status(400).json({ error: 'No se pudo subir ningún documento' });
      }
      
      res.status(201).json({
        message: `${resultados.length} documento(s) subido(s) correctamente`,
        documentos: resultados
      });
    } catch (error) {
      console.error('Error general:', error);
      res.status(500).json({ error: 'Error al subir los documentos' });
    }
  }
];


// VER DOCUMENTO (INLINE)
const verDocumento = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Intentando visualizar documento con ID: ${id}`);
    
    const documento = await Pacientes.obtenerDocumentoPorId(id);
    
    if (!documento) {
      console.error(`Documento con ID ${id} no encontrado en la base de datos`);
      return res.status(404).send('Documento no encontrado en la base de datos');
    }
    
    // Verificar ubicación en ambos campos posibles (ubicacion y nombreArchivo)
    let rutaArchivo = documento.ubicacion;
    
    // Si no hay ubicación pero existe nombreArchivo, usar ese valor
    if ((!rutaArchivo || rutaArchivo.trim() === '') && documento.nombreArchivo) {
      console.log(`Usando nombreArchivo como alternativa: ${documento.nombreArchivo}`);
      rutaArchivo = documento.nombreArchivo;
    }
    
    // Verificación final de la ruta del archivo
    if (!rutaArchivo || rutaArchivo.trim() === '') {
      console.error(`Documento con ID ${id} no tiene ubicación definida. Datos del documento:`, documento);
      return res.status(404).send('Documento sin ubicación válida');
    }
    
    console.log(`Documento encontrado, ubicación: ${rutaArchivo}`);
    
    // Normalizar la key para S3
    let key = rutaArchivo;
    key = key.replace(/\\/g, '/');
    
    if (key.startsWith('http')) {
      const url = new URL(key);
      key = url.pathname.replace(/^\/+/, '');
    }
    
    console.log(`Intentando obtener archivo de S3 con clave normalizada: ${key}`);
    console.log(`Bucket: ${process.env.AWS_BUCKET_NAME}`);
    
    try {
      const data = await s3.getObject({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key
      }).promise();
      
      console.log(`Archivo recuperado de S3, tamaño: ${data.Body.length} bytes`);
      
      // Usar documento.nombre o documento.tipo para el nombre del archivo
      const nombreArchivo = documento.nombre || documento.tipo || 'documento';
      
      res
        .setHeader('Content-Type', 'application/pdf')
        .setHeader('Content-Disposition', `inline; filename="${nombreArchivo}.pdf"`)
        .send(data.Body);
    } catch (s3Error) {
      console.error(`Error de S3: ${s3Error.code} - ${s3Error.message}`);
      if (s3Error.code === 'NoSuchKey') {
        return res.status(404).send(`Archivo no encontrado en S3 (clave: ${key})`);
      }
      throw s3Error;
    }
  } catch (error) {
    console.error('Error al mostrar documento:', error);
    res.status(500).send('Error al procesar la solicitud');
  }
};

// DESCARGAR DOCUMENTO
const descargarDocumento = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Intentando descargar documento con ID: ${id}`);
    
    const documento = await Pacientes.obtenerDocumentoPorId(id);
    
    if (!documento) {
      console.error(`Documento con ID ${id} no encontrado en la base de datos`);
      return res.status(404).json({ 
        error: 'Documento no encontrado en la base de datos',
        detalles: 'El documento solicitado no existe en nuestros registros'
      });
    }
    
    // Verificar ubicación en ambos campos posibles (ubicacion y nombreArchivo)
    let rutaArchivo = documento.ubicacion;
    
    // Si no hay ubicación pero existe nombreArchivo, usar ese valor
    if ((!rutaArchivo || rutaArchivo.trim() === '') && documento.nombreArchivo) {
      console.log(`Usando nombreArchivo como alternativa: ${documento.nombreArchivo}`);
      rutaArchivo = documento.nombreArchivo;
    }
    
    // Verificación final de la ruta del archivo
    if (!rutaArchivo || rutaArchivo.trim() === '') {
      console.error(`Documento con ID ${id} no tiene ubicación definida. Datos del documento:`, documento);
      return res.status(404).json({ 
        error: 'Documento sin ubicación válida',
        detalles: 'Este documento existe en la base de datos pero no tiene una ruta de archivo válida',
        sugerencia: 'Por favor contacte al administrador para corregir el registro'
      });
    }
    
    console.log(`Documento encontrado, ubicación: ${rutaArchivo}`);
    
    // Normalizar la key para S3
    let key = rutaArchivo;
    key = key.replace(/\\/g, '/');
    
    if (key.startsWith('http')) {
      const url = new URL(key);
      key = url.pathname.replace(/^\/+/, '');
    }
    
    console.log(`Intentando obtener archivo de S3 con clave normalizada: ${key}`);
    console.log(`Bucket: ${process.env.AWS_BUCKET_NAME}`);
    
    try {
      const data = await s3.getObject({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key
      }).promise();
      
      console.log(`Archivo recuperado de S3, tamaño: ${data.Body.length} bytes`);
      
      // Priorizar el tipo (es lo que se muestra en la interfaz) sobre el nombre original
      const nombreDescarga = documento.tipo || documento.nombre || 'documento';
      
      // Normalizar el nombre para asegurar que sea válido para descargas
      const nombreArchivo = nombreDescarga
        .replace(/[\/\\:*?"<>|]/g, '_') // Reemplazar caracteres no válidos
        .trim();
      
      res
        .setHeader('Content-Type', 'application/pdf')
        .setHeader('Content-Disposition', `attachment; filename="${nombreArchivo}.pdf"`)
        .send(data.Body);
    } catch (s3Error) {
      console.error(`Error de S3: ${s3Error.code} - ${s3Error.message}`);
      if (s3Error.code === 'NoSuchKey') {
        return res.status(404).json({ 
          error: `Archivo no encontrado en S3`,
          detalles: `La clave ${key} no existe en el bucket ${process.env.AWS_BUCKET_NAME}`,
          sugerencia: 'El archivo puede haber sido eliminado del almacenamiento'
        });
      }
      throw s3Error;
    }
  } catch (error) {
    console.error('Error al descargar documento:', error);
    res.status(500).json({ 
      error: 'Error al procesar la solicitud de descarga',
      mensaje: error.message
    });
  }
};

// ELIMINAR DOCUMENTO
const eliminarDocumento = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('1. Iniciando eliminación de documento:', { id });

    const documento = await Pacientes.obtenerDocumentoPorId(id);
    console.log('2. Documento encontrado en BD:', documento);

    // Verificar ubicación en ambos campos posibles (ubicacion y nombreArchivo)
    let key = documento?.ubicacion || documento?.nombreArchivo;
    
    if (!key) {
      console.log('3. Error: Documento no tiene ubicación ni nombreArchivo');
      return res.status(404).json({ error: 'Documento no encontrado' });
    }

    console.log('4. Key original:', key);

    // Extraer la key del path de S3
    if (key.includes('amazonaws.com')) {
      key = key.split('.com/')[1];
      console.log('5. Key después de procesar URL:', key);
    }

    console.log('6. Intentando eliminar de S3:', {
      bucket: process.env.AWS_BUCKET_NAME,
      key: key
    });

    const deleteParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key
    };

    const deleteResult = await s3.deleteObject(deleteParams).promise();
    console.log('7. Resultado de eliminación en S3:', deleteResult);

    const dbResult = await Pacientes.eliminarDocumento(id);
    console.log('8. Resultado de eliminación en BD:', dbResult);

    res.json({ 
      message: 'Documento eliminado correctamente',
      s3Result: deleteResult,
      dbResult: dbResult
    });

  } catch (error) {
    console.error('9. Error en eliminarDocumento:', {
      code: error.code,
      message: error.message,
      stack: error.stack
    });

    const status = error.code === 'NoSuchKey' ? 404 : 500;
    const msg = error.code === 'NoSuchKey'
      ? 'Archivo no encontrado en S3'
      : 'Error al eliminar el documento';
      
    res.status(status).json({ 
      error: msg,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getRegistrarPaciente,
  postRegistrarPaciente,
  getEditarPaciente,
  postEditarPaciente,
  postEliminarPaciente,
  getPacientes,
  obtenerExpediente,
  obtenerDocumentosPorExpediente,
  subirMultiplesDocumentos,
  descargarDocumento,
  eliminarDocumento,
  verDocumento
};