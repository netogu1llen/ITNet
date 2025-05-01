const Psicologia = require('../models/psicologia.model'); // Modelo de psicología
const path = require('path');
const fs = require('fs');
const ejs = require('ejs');
const puppeteer = require('puppeteer');
const multer = require('multer'); // Añadir multer al controlador
const { decrypt } = require('../util/encryptData'); // Importar función de desencriptación
const s3 = require('../util/s3Client');

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


const upload = multer({ storage: multer.memoryStorage() });
exports.subirDocumentoMiddleware = [
  upload.single('archivoDocumento'),
  async (req, res) => {
      try {
          const { nombreDocumento } = req.body;
          const { IDExpediente } = req.params;

          if (!req.file || req.file.mimetype !== 'application/pdf') {
              return res.status(400).json({ error: 'Debe subir un archivo PDF válido' });
          }

          // Obtener datos del paciente para crear la carpeta
          const expediente = await Psicologia.obtenerExpedientePorId(IDExpediente);
          
          // Desencriptar nombres para crear el nombre de la carpeta
          const nombres = decrypt(expediente.nombres);
          const apellidoP = decrypt(expediente.apellidoP);
          const apellidoM = decrypt(expediente.apellidoM);
          
          // Crear nombre de carpeta normalizado
          const nombreCarpeta = `${apellidoP}_${apellidoM}_${nombres}`
              .toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .replace(/[^a-z0-9]/g, '_');

          // Crear la ruta del archivo en S3
          const fileName = `psicologia/${nombreCarpeta}/${Date.now()}_${nombreDocumento.replace(/[^a-z0-9]/gi, '_')}`;
          const fileKey = `${fileName}.pdf`;
          
          const params = {
              Bucket: process.env.AWS_BUCKET_NAME,
              Key: fileKey,
              Body: req.file.buffer,
              ContentType: 'application/pdf',
          };

          // Subir archivo a S3
          await s3.upload(params).promise();

          // Guardar en la base de datos
          const nuevoDocumento = await Psicologia.subirPrueba({
              IDExpediente,
              nombre: nombreDocumento,
              ubicacion: fileKey,
              fecha: new Date(),
              eliminado: 0
          });

          res.status(201).json({
              message: 'Documento subido correctamente',
              documento: nuevoDocumento
          });
      } catch (error) {
          console.error('Error al subir el documento:', error);
          res.status(500).json({ error: 'Error al subir el documento' });
      }
  }
];

exports.verDocumento = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`Intentando visualizar documento con ID: ${id}`);
        
        // Primero intentar obtener el documento
        const documento = await Psicologia.obtenerDocumentoPorId(id);
        
        if (!documento) {
            console.error(`Documento con ID ${id} no encontrado en la base de datos`);
            return res.status(404).json({
                error: 'Documento no encontrado en la base de datos',
                detalles: 'El documento solicitado no existe en nuestros registros'
            });
        }
        
        // Verificar ubicación en ambos campos posibles
        let rutaArchivo = documento.ubicacion;
        
        if ((!rutaArchivo || rutaArchivo.trim() === '') && documento.nombreArchivo) {
            console.log(`Usando nombreArchivo como alternativa: ${documento.nombreArchivo}`);
            rutaArchivo = documento.nombreArchivo;
        }
        
        if (!rutaArchivo || rutaArchivo.trim() === '') {
            console.error(`Documento con ID ${id} no tiene ubicación definida:`, documento);
            return res.status(404).json({
                error: 'Documento sin ubicación válida',
                detalles: 'El documento existe pero no tiene una ruta válida',
                sugerencia: 'Contacte al administrador del sistema'
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
            
            // Usar nombre del documento o tipo, con fallback a 'documento'
            const nombreArchivo = documento.nombre || documento.tipo || 'documento';
            
            res
                .setHeader('Content-Type', 'application/pdf')
                .setHeader('Content-Disposition', `inline; filename="${nombreArchivo}.pdf"`)
                .send(data.Body);
                
        } catch (s3Error) {
            console.error(`Error de S3: ${s3Error.code} - ${s3Error.message}`);
            if (s3Error.code === 'NoSuchKey') {
                return res.status(404).json({
                    error: 'Archivo no encontrado en S3',
                    detalles: `La clave ${key} no existe en el bucket ${process.env.AWS_BUCKET_NAME}`,
                    sugerencia: 'El archivo puede haber sido eliminado del almacenamiento'
                });
            }
            throw s3Error;
        }
    } catch (error) {
        console.error('Error al mostrar documento:', error);
        res.status(500).json({
            error: 'Error al procesar la solicitud',
            mensaje: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

exports.descargarDocumento = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('1. Iniciando descarga, ID:', id);

        // Primero verificar si es un seguimiento
        const seguimiento = await Psicologia.obtenerPorId(id);
        
        if (seguimiento) {
            console.log('2. Es un seguimiento, obteniendo datos adicionales...');
            
            // Obtener datos necesarios para el seguimiento
            const actividades = await Psicologia.obtenerObjetivosPorSeguimientoId(id);
            let expediente = await Psicologia.obtenerExpedientePorId(seguimiento.IDExpediente);
            expediente = desencriptarExpediente(expediente);

            console.log('3. Generando PDF del seguimiento...');

            // Generar HTML del seguimiento
            const html = await ejs.renderFile(
                path.join(__dirname, '../views/pdf/seguimiento.ejs'),
                { seguimiento, actividades, expediente }
            );

            // Guardar HTML para depuración
            fs.writeFileSync(path.join(__dirname, '../temp_seguimiento.html'), html);

            // Configurar y generar PDF
            console.log('4. Iniciando Puppeteer...');
            const browser = await puppeteer.launch({
                headless: 'new',
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });

            const page = await browser.newPage();
            await page.emulateMediaType('screen');
            await page.setContent(html, { waitUntil: 'networkidle0' });

            const pdfBuffer = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: { top: "20px", bottom: "20px", left: "20px", right: "20px" }
            });

            await browser.close();
            console.log('5. PDF generado correctamente');

            // Enviar PDF generado
            res.setHeader('Content-Type', 'application/pdf')
               .setHeader('Content-Disposition', 'attachment; filename=seguimiento.pdf')
               .end(pdfBuffer);
            return;
        }

        // Si no es un seguimiento, buscar documento
        console.log('2. No es seguimiento, buscando documento...');
        const documento = await Psicologia.obtenerDocumentoPorId(id);

        if (!documento) {
            console.error('3. No se encontró ni seguimiento ni documento');
            return res.status(404).json({
                error: 'Recurso no encontrado',
                detalles: 'No se encontró ningún documento o seguimiento con el ID proporcionado'
            });
        }

        // Procesar documento desde S3
        console.log('3. Documento encontrado, procesando...');
        let rutaArchivo = documento.ubicacion;
        
        if ((!rutaArchivo || rutaArchivo.trim() === '') && documento.nombreArchivo) {
            console.log('4. Usando nombreArchivo alternativo');
            rutaArchivo = documento.nombreArchivo;
        }

        if (!rutaArchivo || rutaArchivo.trim() === '') {
            console.error('5. Error: Documento sin ubicación válida');
            return res.status(404).json({
                error: 'Documento sin ubicación válida',
                detalles: 'El documento existe pero no tiene una ruta válida'
            });
        }

        // Normalizar key para S3
        let key = rutaArchivo;
        key = key.replace(/\\/g, '/');
        
        if (key.startsWith('http')) {
            const url = new URL(key);
            key = url.pathname.replace(/^\/+/, '');
        }

        console.log('6. Intentando obtener archivo de S3:', key);

        try {
            const data = await s3.getObject({
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: key
            }).promise();

            console.log('7. Archivo S3 recuperado correctamente');
            
            const nombreDescarga = documento.nombre || documento.tipo || 'documento';
            
            res.setHeader('Content-Type', 'application/pdf')
               .setHeader('Content-Disposition', `attachment; filename="${nombreDescarga}.pdf"`)
               .send(data.Body);

        } catch (s3Error) {
            console.error('8. Error de S3:', s3Error);
            if (s3Error.code === 'NoSuchKey') {
                return res.status(404).json({
                    error: 'Archivo no encontrado en S3',
                    detalles: `No se encontró el archivo en el almacenamiento`
                });
            }
            throw s3Error;
        }

    } catch (error) {
        console.error('Error general:', error);
        res.status(500).json({
            error: 'Error al procesar la solicitud',
            detalles: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
        });
    }
};


exports.eliminarDocumento = async (req, res) => {
    try {
        const { id } = req.params;
        const tipo = req.query.tipo;
        console.log(`Intentando eliminar ${tipo || 'elemento'} con ID:`, id);

        // Manejar eliminación de seguimientos (mantener lógica existente)
        if (tipo === 'seguimiento') {
            const seguimiento = await Psicologia.obtenerPorId(id);
            if (seguimiento) {
                await Psicologia.eliminarSeguimiento(id);
                return res.json({ message: 'Seguimiento eliminado correctamente' });
            }
            return res.status(404).json({ error: 'Seguimiento no encontrado' });
        }

        // Manejar eliminación de documentos
        const documento = await Psicologia.obtenerDocumentoPorId(id);
        if (documento) {
            if (documento.ubicacion) {
                const key = documento.ubicacion.startsWith('http') 
                    ? documento.ubicacion.split('.com/')[1]
                    : documento.ubicacion;

                await s3.deleteObject({
                    Bucket: process.env.AWS_BUCKET_NAME,
                    Key: key
                }).promise();
            }
            
            await Psicologia.eliminarDocumento(id);
            return res.json({ message: 'Documento eliminado correctamente' });
        }

        return res.status(404).json({ error: 'Documento no encontrado' });

    } catch (error) {
        console.error('Error al eliminar:', error);
        res.status(500).json({ 
            error: 'Error al eliminar el documento o seguimiento',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
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