const Pacientes = require('../models/pacientes.model');
const { encrypt, decrypt } = require('../util/encryptData');
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
    
    res.render('pacientes', { pacientes: pacientesDesencriptados });
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
    res.render('registrarPaciente');
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
    } = req.body;
    // Encriptar los campos sensibles
    const pacienteEncriptado = {
      nombres: encrypt(nombres).encryptedData,
      apellidoP: encrypt(apellidoP).encryptedData,
      apellidoM: encrypt(apellidoM).encryptedData,
      fechaNacimiento: encrypt(fechaNacimiento).encryptedData,
      contacto: encrypt(contacto).encryptedData,
      estado: encrypt(estado).encryptedData,
      ciudad: encrypt(ciudad).encryptedData,
      calle: encrypt(calle).encryptedData,
      cp: encrypt(cp).encryptedData,
      localidad: encrypt(localidad).encryptedData,
      numCasa: encrypt(numCasa).encryptedData,
      numExpediente,
      enfermedades,
      medicamentos,
      estudioSocioeconomico,
      grado,
      nvEscolar,
      sangre
    };
    await Pacientes.registrarPaciente(pacienteEncriptado);

    res.status(200).json({ mensaje: 'Datos registrados correctamente' });
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


    res.render('editarPaciente', { datos: paciente});
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
    } = req.body;
    const pacienteEncriptado = {
      nombres: encrypt(nombres).encryptedData,
      apellidoP: encrypt(apellidoP).encryptedData,
      apellidoM: encrypt(apellidoM).encryptedData,
      fechaNacimiento: encrypt(fechaNacimiento).encryptedData,
      contacto: encrypt(contacto).encryptedData,
      estado: encrypt(estado).encryptedData,
      ciudad: encrypt(ciudad).encryptedData,
      calle: encrypt(calle).encryptedData,
      cp: encrypt(cp).encryptedData,
      localidad: encrypt(localidad).encryptedData,
      numCasa: encrypt(numCasa).encryptedData,
      numExpediente,
      enfermedades,
      medicamentos,
      estudioSocioeconomico,
      grado,
      nvEscolar,
      sangre,
      idExpediente
    };

    await Pacientes.editarPaciente(pacienteEncriptado);

    res.status(200).json({ mensaje: 'Datos actualizados correctamente' });
  } catch (error) {
    console.error('Error al actualizar paciente:', error.message);
    res.status(500).json({
      mensaje: 'Error al actualizar. Por favor, intenta nuevamente más tarde.'
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

      // Obtener documentos
      const documentosAdjuntos = await Pacientes.obtenerDocumentosAdjuntos(idExpediente);
      const documentos = [...documentosAdjuntos];

      // Obtener datos del expediente y desencriptar
      let expediente = await Pacientes.obtenerExpedientePorId(idExpediente);
      expediente = desencriptarExpediente(expediente);

      // Renderizar la vista con los datos
      res.render('expediente', {
          expediente,
          documentos
      });
  } catch (error) {
      console.error('Error al obtener expediente:', error);
      res.status(500).json({ error: 'Error al obtener expediente' });
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
          documentos
      });
  } catch (error) {
      console.error('Error al obtener documentos:', error);
      res.status(500).json({ error: 'Error al obtener documentos' });
  }
};

const upload = multer({ storage: multer.memoryStorage() });

const subirDocumento = [
  upload.single('archivoDocumento'),
  async (req, res) => {
    try {
      const { nombreDocumento } = req.body;
      const { IDExpediente } = req.params;

      if (!req.file || req.file.mimetype !== 'application/pdf') {
        return res.status(400).json({ error: 'Debe subir un archivo PDF válido' });
      }

      // Primero obtener los datos del paciente para crear la carpeta
      const paciente = await Pacientes.getPaciente(IDExpediente);
      
      // Desencriptar nombres para crear el nombre de la carpeta
      const nombres = decrypt(paciente.nombres);
      const apellidoP = decrypt(paciente.apellidoP);
      const apellidoM = decrypt(paciente.apellidoM);
      
      // Crear nombre de carpeta normalizado (sin espacios ni caracteres especiales)
      const nombreCarpeta = `${apellidoP}_${apellidoM}_${nombres}`
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
        .replace(/[^a-z0-9]/g, '_'); // Reemplazar caracteres especiales con _

      // Crear la ruta completa del archivo
      const fileName = `general/${nombreCarpeta}/${Date.now()}_${nombreDocumento.replace(/[^a-z0-9]/gi, '_')}`;
      const fileKey = `${fileName}.pdf`;
      
      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileKey,
        Body: req.file.buffer, // Usar el buffer directamente sin convertir a base64
        ContentType: 'application/pdf',
      };

      // Subir archivo a S3
      const data = await s3.upload(params).promise();

      const nuevoDocumento = await Pacientes.subirDocumento({
        IDExpediente,
        nombre: nombreDocumento,
        ubicacion: fileKey, // Guardar solo la Key en lugar de la URL completa
        fecha: new Date(),
        eliminado: 0
      });

      res.status(201).json({
        mensaje: 'Documento subido exitosamente',
        documento: nuevoDocumento
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Error al subir el documento' });
    }
  }
];
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
      
      // Usar documento.nombre o documento.tipo para el nombre del archivo
      const nombreDescarga = documento.nombre || documento.tipo || 'documento';
      
      res
        .setHeader('Content-Type', 'application/pdf')
        .setHeader('Content-Disposition', `attachment; filename="${nombreDescarga}.pdf"`)
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
    const documento = await Pacientes.obtenerDocumentoPorId(id);

    if (!documento?.ubicacion) {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }

    let key = documento.ubicacion;
    if (key.startsWith('http')) {
      const url = new URL(key);
      key = url.pathname.replace(/^\/+/, '');
    }

    await s3.deleteObject({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key
    }).promise();

    await Pacientes.eliminarDocumento(id);

    res.json({ message: 'Documento eliminado correctamente' });

  } catch (error) {
    console.error('Error al eliminar documento:', error);
    const status = error.code === 'NoSuchKey' ? 404 : 500;
    const msg = error.code === 'NoSuchKey'
      ? 'Archivo no encontrado en S3'
      : 'Error al eliminar el documento';
    res.status(status).json({ error: msg });
  }
};

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

module.exports = {
  getRegistrarPaciente,
  postRegistrarPaciente,
  getEditarPaciente,
  postEditarPaciente,
  postEliminarPaciente,
  getPacientes,
  obtenerExpediente,
  obtenerDocumentosPorExpediente,
  subirDocumento,
  descargarDocumento,
  eliminarDocumento,
  verDocumento
};