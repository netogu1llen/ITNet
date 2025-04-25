const Psicologia = require('../models/psicologia.model'); // Modelo de psicología
const path = require('path');
const fs = require('fs');
const ejs = require('ejs');
const puppeteer = require('puppeteer');
const multer = require('multer'); // Añadir multer al controlador
const { decrypt } = require('../util/encryptData'); // Importar función de desencriptación

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
      
      // Desencriptar ubicación
      if (expediente.ubicacion) {
          expediente.ubicacion = decrypt(expediente.ubicacion);
      }
      
      // Desencriptar domicilio
      if (expediente.domicilio) {
          expediente.domicilio = decrypt(expediente.domicilio);
      }
      
      return expediente;
  } catch (error) {
      console.error('Error al desencriptar datos del expediente:', error);
      return expediente; // Devolver el expediente original si hay error
  }
};

// Listar documentos de un expediente
exports.obtenerDocumentosPorExpediente = async (req, res) => {
  try {
      const { idExpediente } = req.params;

      // Obtener documentos de ambas tablas
      const documentosAdjuntos = await Psicologia.obtenerDocumentosAdjuntos(idExpediente);
      const seguimientosPsicologicos = await Psicologia.obtenerSeguimientosPsicologicos(idExpediente);

      // Combinar los resultados
      const documentos = [...documentosAdjuntos, ...seguimientosPsicologicos];

      // Obtener datos del expediente y desencriptar
      // CAMBIO: Usar obtenerExpedientePorId en lugar de getDatosGenerales
      let expediente = await Psicologia.obtenerExpedientePorId(idExpediente);
      
      // Log antes de desencriptar
      console.log('DATOS DEL EXPEDIENTE ANTES DE DESENCRIPTAR:', JSON.stringify(expediente, null, 2));
      expediente = desencriptarExpediente(expediente);

      // Renderizar la vista con los datos dinámicos
      res.render('expedientePsicologico', {
          expediente,
          documentos
      });
  } catch (error) {
      console.error('Error al obtener documentos:', error);
      res.status(500).json({ error: 'Error al obtener documentos' });
  }
};

// Registrar un nuevo documento
exports.registrarDocumento = async (req, res) => {
    try {
        const { idExpediente, tipo, fechaCreacion, nombreArchivo } = req.body;

        // Registrar el documento en la base de datos
        const nuevoDocumento = await Psicologia.registrarDocumento({
            idExpediente,
            tipo,
            fechaCreacion,
            nombreArchivo
        });

        res.status(201).json({ message: 'Documento registrado correctamente', documento: nuevoDocumento });
    } catch (error) {
        console.error('Error al registrar documento:', error);
        res.status(500).json({ error: 'Error al registrar documento' });
    }
};

exports.descargarDocumento = async (req, res) => {
  try {
      const id = req.params.id;

      let documento = await Psicologia.obtenerDocumentoPorId(id);

      if (!documento) {
          console.warn('No se encontró documento, intentando buscar seguimiento...');

          const seguimiento = await Psicologia.obtenerPorId(id);
          if (!seguimiento) {
              console.error('Ni documento ni seguimiento encontrados');
              return res.status(404).send('Documento o seguimiento no encontrado');
          }
          
          const actividades = await Psicologia.obtenerObjetivosPorSeguimientoId(id);
          
          // Usar getDatosGenerales para obtener datos consistentes sin info antropométrica
          let expediente = await Psicologia.obtenerExpedientePorId(seguimiento.IDExpediente);
          
          // Desencriptar expediente
          expediente = desencriptarExpediente(expediente);

          const html = await ejs.renderFile(
              path.join(__dirname, '../views/pdf/seguimiento.ejs'),
              { seguimiento, actividades, expediente }
          );

          const browser = await puppeteer.launch();
          const page = await browser.newPage();
          await page.emulateMediaType('screen');
          await page.setContent(html, { waitUntil: 'networkidle0' });

          const pdfBuffer = await page.pdf({
              format: 'A4',
              printBackground: true,
              margin: { top: "20px", bottom: "20px", left: "20px", right: "20px" }
          });

          await browser.close();

          // Esto es clave para evitar PDFs corruptos
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', 'attachment; filename=seguimiento.pdf');
          return res.end(pdfBuffer);
      }

      // Si se encontró un documento normal, intentar descargarlo desde el sistema de archivos.
      const rutaDocumento = path.join(__dirname, '..', documento.nombreArchivo || `${id}.pdf`);

      if (fs.existsSync(rutaDocumento)) {
          return res.download(rutaDocumento);
      } else {
          console.error('Archivo no encontrado en el sistema de archivos:', rutaDocumento);
          return res.status(404).send('Archivo no encontrado');
      }

  } catch (error) {
      console.error('Error al procesar la solicitud de descarga:', error);
      return res.status(500).send('Error interno del servidor');
  }
};

  

exports.eliminarDocumento = async (req, res) => {
  try {
      const { id } = req.params;
      const tipo = req.query.tipo; // Obtener el tipo desde query parameters
      console.log(`Intentando eliminar ${tipo || 'elemento'} con ID:`, id);

      // Si se especifica el tipo como "seguimiento", buscar directamente como seguimiento
      if (tipo === 'seguimiento') {
          const seguimiento = await Psicologia.obtenerPorId(id);
          if (seguimiento) {
              console.log('Encontrado como seguimiento psicológico:', seguimiento);
              await Psicologia.eliminarSeguimiento(id);
              return res.json({ message: 'Seguimiento eliminado correctamente' });
          } else {
              return res.status(404).json({ error: 'Seguimiento no encontrado' });
          }
      } 
      // Si se especifica el tipo como "documento", buscar directamente como documento
      else if (tipo === 'documento') {
          const documento = await Psicologia.obtenerDocumentoPorId(id);
          if (documento) {
              console.log('Encontrado como documento:', documento);
              if (documento.ubicacion) {
                  const filePath = path.join(__dirname, '..', documento.ubicacion);
                  if (fs.existsSync(filePath)) {
                      console.log('Archivo encontrado pero no eliminado físicamente:', filePath);
                  }
              }
              await Psicologia.eliminarDocumento(id);
              return res.json({ message: 'Documento eliminado correctamente' });
          } else {
              return res.status(404).json({ error: 'Documento no encontrado' });
          }
      } 
      // Si no se especifica tipo, intentar buscar en ambas tablas (comportamiento actual)
      else {
          // Primero intentar obtener como seguimiento psicológico
          let documento = await Psicologia.obtenerPorId(id);
          if (documento) {
              console.log('Encontrado como seguimiento psicológico:', documento);
              await Psicologia.eliminarSeguimiento(id);
              return res.json({ message: 'Seguimiento eliminado correctamente' });
          }

          // Si no es seguimiento, intentar como documento normal
          documento = await Psicologia.obtenerDocumentoPorId(id);
          if (documento) {
              console.log('Encontrado como documento:', documento);
              if (documento.ubicacion) {
                  const filePath = path.join(__dirname, '..', documento.ubicacion);
                  if (fs.existsSync(filePath)) {
                      console.log('Archivo encontrado pero no eliminado físicamente:', filePath);
                  }
              }
              await Psicologia.eliminarDocumento(id);
              return res.json({ message: 'Documento eliminado correctamente' });
          }

          // Si no se encontró en ninguna tabla
          return res.status(404).json({ error: 'Documento o seguimiento no encontrado' });
      }
  } catch (error) {
      console.error('Error al eliminar:', error);
      res.status(500).json({ error: 'Error al eliminar el documento o seguimiento' });
  }
};


// Configuración de Multer para guardar archivos localmente
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, 'uploads/'); // Carpeta donde se guardarán los archivos
  },
  filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname)); // Nombre único para evitar conflictos
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
      cb(null, true); // Aceptar solo archivos PDF
  } else {
      cb(new Error('Solo se permiten archivos PDF.'));
  }
};

const upload = multer({ storage, fileFilter });



// Middleware de subida con controlador integrado
exports.subirDocumentoMiddleware = [
  upload.single('archivoDocumento'),
  async (req, res) => {
      try {
          const { nombreDocumento } = req.body;
          const { IDExpediente } = req.params; // Obtener ID del expediente desde la URL

          if (!req.file) {
              return res.status(400).json({ error: 'Debe subir un archivo válido.' });
          }

          // Creamos la ruta completa al archivo
          const ubicacion = req.file.path;
          const fecha = new Date(); // Fecha actual
          const eliminado = 0; // Por defecto, no eliminado

          console.log('Subiendo documento:', {
              IDExpediente,
              nombre: nombreDocumento,
              ubicacion,
              fecha
          });

          // Guardar en la base de datos
          const nuevoDocumento = await Psicologia.subirPrueba({
              IDExpediente,
              nombre: nombreDocumento,
              ubicacion,
              fecha,
              eliminado
          });

          res.status(201).json({ message: 'Documento subido correctamente', documento: nuevoDocumento });
      } catch (error) {
          console.error('Error al subir el documento:', error);
          res.status(500).json({ error: 'Error al subir el documento' });
      }
  }
];

// Ver documento
exports.verDocumento = async (req, res) => {
    try {
        const documentoId = req.params.id;
        console.log('verDocumento con id:', documentoId);
        
        // Buscar el documento en la base de datos
        const documento = await Psicologia.obtenerDocumentoPorId(documentoId);
        
        if (!documento) {
            console.error('Documento no encontrado en la base de datos');
            return res.status(404).send('Documento no encontrado');
        }
        
        console.log('Documento encontrado:', documento);
        
        // Construir la ruta directamente sin agregar 'uploads'
        const rutaDocumento = path.join(__dirname, '..', documento.nombreArchivo || `${documentoId}.pdf`);
        
        console.log('Intentando acceder al archivo en:', rutaDocumento);
        
        // Verificar si el archivo existe
        if (fs.existsSync(rutaDocumento)) {
            return res.sendFile(rutaDocumento); // Si el archivo existe, lo enviamos
        } else {
            console.error('Archivo no encontrado en el sistema de archivos:', rutaDocumento);
            return res.status(404).send('Archivo no encontrado');
        }
    } catch (error) {
        console.error('Error al mostrar documento:', error);
        return res.status(500).send('Error al procesar la solicitud');
    }
};

// Modificar get_editar_seguimiento
exports.get_editar_seguimiento = async (req, res) => {
  const IDSEGUIMIENTO = req.params.id;
  try {
      // Obtener el seguimiento
      const seguimiento = await Psicologia.obtenerPorId(IDSEGUIMIENTO);
      if (!seguimiento) {
          return res.status(404).send('Seguimiento no encontrado');
      }
      
      // Obtener los objetivos
      const objetivos = await Psicologia.obtenerObjetivosPorSeguimientoId(IDSEGUIMIENTO);
      
      // Obtener el expediente directamente
      let expediente = await Psicologia.obtenerExpedientePorId(seguimiento.IDExpediente);
      
      // Desencriptar los datos
      expediente = desencriptarExpediente(expediente);
      
      res.render('editarSeguimiento', {
          seguimiento,
          objetivos: objetivos || [],
          expediente
      });
  } catch (err) {
      console.error('Error al obtener seguimiento:', err);
      return res.status(500).send('Error en el servidor');
  }
};
  
  

  exports.post_editar_seguimiento = async (req, res) => {
    const id = req.params.id;
    const {
      objetivoSesion,
      justificacionSesion,
      analisisPsicologico,
      recomendaciones,
      bitacora,
      objetivoId = [], // Añadimos el ID de cada objetivo para actualizar
      actividad = [],
      tiempo = [],
      metodologia = [],
      objetivo = [],
      observaciones = []
    } = req.body;
  
    try {
      // Obtener el IDExpediente del seguimiento actual
      const seguimiento = await Psicologia.obtenerPorId(id);
      if (!seguimiento) {
        throw new Error('Seguimiento no encontrado');
      }
  
      // Actualizar el seguimiento
      await Psicologia.actualizarSeguimiento(id, objetivoSesion, justificacionSesion, analisisPsicologico, recomendaciones, bitacora);
  
      // Obtener los objetivos existentes
      const objetivosExistentes = await Psicologia.obtenerObjetivosPorSeguimientoId(id);
      const objetivosExistentesIds = objetivosExistentes.map(obj => obj.IDObjetivo);
      
      // Procesar los objetivos
      const maxLength = Math.max(
        actividad.length,
        tiempo.length,
        metodologia.length,
        objetivo.length,
        observaciones.length
      );
  
      for (let i = 0; i < maxLength; i++) {
        // Si hay un ID de objetivo existente, actualizamos
        if (objetivoId[i] && objetivosExistentesIds.includes(parseInt(objetivoId[i]))) {
          await Psicologia.actualizarObjetivo(
            objetivoId[i],
            actividad[i], 
            tiempo[i], 
            metodologia[i], 
            objetivo[i], 
            observaciones[i]
          );
        } else {
          // Si no hay ID o no existe, creamos uno nuevo
          await Psicologia.insertarObjetivos(
            id, 
            actividad[i], 
            tiempo[i], 
            metodologia[i], 
            objetivo[i], 
            observaciones[i]
          );
        }
      }
  
      // Responder con éxito y el IDExpediente para la redirección
      res.status(200).json({ 
        mensaje: 'Datos actualizados correctamente',
        idExpediente: seguimiento.IDExpediente 
      });
  
    } catch (err) {
      console.error('Error al actualizar seguimiento:', err);
      res.status(500).json({ mensaje: 'Error al actualizar. Favor de intentar en otro momento' });
    }
  };

  exports.get_registrar_seguimiento = async (req, res) => {
    try {
        const idExpediente = req.params.id;
        // CAMBIO: Usar obtenerExpedientePorId en lugar de getDatosGenerales
        let expediente = await Psicologia.obtenerExpedientePorId(idExpediente);
        
        // Desencriptar expediente
        expediente = desencriptarExpediente(expediente);
        
        res.render('registrarSeguimiento', { expediente });
    } catch (error) {
        console.error('Error al obtener la información:', error.message);
        res.status(500).send('Error al obtener la información');
    }
};

exports.post_registrar_seguimiento = async (req, res) => {
  try {
    const idExpediente = req.params.id;
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ mensaje: 'No se recibieron datos' });
    }

    const {
      objetivoSesion,
      justificacionSesion,
      analisisPsicologico,
      recomendaciones,
      bitacora,
      actividad = [], 
      tiempo = [],
      metodologia = [],
      objetivo = [],
      observaciones = []
    } = req.body;

    // Validar que los campos principales no estén vacíos
    if (!objetivoSesion || !justificacionSesion || !analisisPsicologico || !recomendaciones || !bitacora) {
      return res.status(400).json({ mensaje: 'Todos los campos son requeridos' });
    }

    const idSeguimiento = await Psicologia.registrarSeguimiento(
      idExpediente,
      objetivoSesion,
      justificacionSesion,
      analisisPsicologico,
      recomendaciones,
      bitacora
    );

    if (!idSeguimiento) {
      throw new Error('Error al registrar el seguimiento');
    }

    const maxLength = Math.max(
      actividad.length,
      tiempo.length,
      metodologia.length,
      objetivo.length,
      observaciones.length
    );

    // Validar que haya al menos una actividad
    if (maxLength === 0) {
      return res.status(400).json({ mensaje: 'Debe registrar al menos una actividad' });
    }

    for (let i = 0; i < maxLength; i++) {
      if (!actividad[i] || !tiempo[i] || !metodologia[i] || !objetivo[i] || !observaciones[i]) {
        throw new Error('Todos los campos de las actividades son requeridos');
      }
      
      await Psicologia.insertarObjetivos(
        idSeguimiento, 
        actividad[i], 
        tiempo[i], 
        metodologia[i], 
        objetivo[i], 
        observaciones[i]
      );
    }

    res.status(200).json({ mensaje: 'Seguimiento registrado correctamente' });

  } catch (error) {
    console.error('Error al registrar:', error);
    res.status(500).json({ 
      mensaje: error.message || 'Error al registrar el seguimiento. Por favor, intente nuevamente' 
    });
  }
};


/*-------------------------PACIENTES PSICOLOGIA--------------------------------*/

// Obtener todos los pacientes para psicología
exports.getPacientesPsicologia = async (req, res) => {
  try {
    const pacientes = await Psicologia.obtenerTodos();
    
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
    
    res.render('psicologia', { pacientes: pacientesDesencriptados });
  } catch (error) {
    console.error('Error al obtener la información:', error.message);
    res.status(500).send('Error al obtener la información');
  }
};