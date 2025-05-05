const Nutricion = require('../models/nutricion.model');
const { decrypt } = require('../util/encryptData');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const ejs = require('ejs');
const puppeteer = require('puppeteer');
const s3 = require('../util/s3Client');

// Al principio del archivo, reemplaza la configuración actual de multer:

// Configuración unificada de multer
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB máximo
    fileFilter: (req, file, cb) => {
      if (file.mimetype === 'application/pdf') {
        cb(null, true);
      } else {
        cb(new Error('Solo se permiten archivos PDF.'));
      }
    }
});
  


const { request, response } = require("express");

// Obtener todos los pacientes para nutrición
exports.obtenerHistoriales = async (req, res) => {
    try {
        const pacientes = await Nutricion.obtenerTodos();

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
                return {
                    IDExpediente: paciente.IDExpediente,
                    nombreCompleto: `${decrypt(paciente.nombres)} ${decrypt(paciente.apellidoP)} ${decrypt(paciente.apellidoM)}`.trim(),
                    fechaNacimiento: decrypt(paciente.fechaNacimiento),
                    nvEscolar: paciente.nvEscolar || 'Sin nivel registrado'
                };
            } catch (error) {
                console.error(`Error al desencriptar paciente ID ${paciente.IDExpediente}:`, error);
                return {
                    IDExpediente: paciente.IDExpediente,
                    nombreCompleto: '[Error en datos]',
                    fechaNacimiento: '[Error en fecha]',
                    nvEscolar: paciente.nvEscolar || 'Sin nivel registrado'
                };
            }
        });

        res.render('nutricion', { pacientes: pacientesDesencriptados });
    } catch (error) {
        console.error('Error al obtener la información:', error);
        res.status(500).send('Error al obtener la información');
    }
};

// Eliminar un paciente
exports.eliminarHistorial = async (req, res) => {
  try {
    const idExpediente = req.params.id;
    await Nutricion.eliminar(idExpediente);
    res.status(200).json({ mensaje: 'Datos eliminados correctamente' });
  } catch (error) {
    console.error('Error al eliminar:', error.message);
    res.status(500).json({ mensaje: 'Error al eliminar. Favor de intentar en otro momento' });
  }
};

// Obtener expediente nutricional completo
exports.getExpedienteNutricion = async (req, res) => {
    try {
        const idExpediente = req.params.id;

        if (!idExpediente || isNaN(parseInt(idExpediente))) {
            return res.status(400).json({ mensaje: 'ID del expediente no válido.' });
        }

        // Obtener información general del paciente
        const datosGeneralesPacienteEncriptados = await Nutricion.obtenerDatosGenerales(idExpediente);

        if (!datosGeneralesPacienteEncriptados) {
            return res.status(404).json({ mensaje: 'Expediente no encontrado.' });
        }

        const expediente = await Nutricion.obtenerPorId(idExpediente);

        // Desencriptar y formatear datos del paciente
        const datosGeneralesPaciente = {
            nombres: decrypt(datosGeneralesPacienteEncriptados.nombres || ''),
            apellidoP: decrypt(datosGeneralesPacienteEncriptados.apellidoP || ''),
            apellidoM: decrypt(datosGeneralesPacienteEncriptados.apellidoM || ''),
            fechaNacimiento: decrypt(datosGeneralesPacienteEncriptados.fechaNacimiento || ''),
            telefono: decrypt(datosGeneralesPacienteEncriptados.contacto || ''),
            escuela: datosGeneralesPacienteEncriptados.nvEscolar || 'No registrado',
            sexo: datosGeneralesPacienteEncriptados.sexo || 'No especificado',
            edadPaciente: calcularEdad(decrypt(datosGeneralesPacienteEncriptados.fechaNacimiento || '')),
            tipoSangre: datosGeneralesPacienteEncriptados.sangre || 'No registrado'
        };

        // Obtener datos requeridos usando el nombre correcto del método
        const [
            antecedentes,
            datosAntropometricos,
            { manejoNutricional },
            documentosHistorial
        ] = await Promise.all([
            Nutricion.obtenerAntecedentes(idExpediente),
            Nutricion.obtenerUltimosAntropometricos(idExpediente),
            Nutricion.obtenerManejoNutricional(idExpediente), // Corregido aquí
            Nutricion.obtenerDocumentosHistorial(idExpediente)
        ]);

        // Formatear fechas
        const documentosHistorialFormateados = documentosHistorial.map(item => ({
            ...item,
            fechaFormateada: item.fecha ? new Date(item.fecha).toLocaleDateString() : 'Fecha no disponible'
        }));

        res.render('expediente_nutricion', {
            expediente,
            datosGeneralesPaciente,
            antecedentesHeredofamiliares: antecedentes.heredofamiliares,
            antecedentesPersonales: antecedentes.personales,
            antecedentesAlimentacion: antecedentes.alimentacion,
            datosAntropometricos,
            manejoNutricional,
            documentosHistorial: documentosHistorialFormateados,
            user: req.user
        });

    } catch (error) {
        console.error('Error al obtener el expediente nutricional:', error);
        res.status(500).send('Error interno al obtener el expediente nutricional.');
    }
};
// Función auxiliar para calcular la edad a partir de la fecha de nacimiento
function calcularEdad(fechaNacimiento) {
  try {
    const fechaNac = new Date(fechaNacimiento);
    const hoy = new Date();
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const mes = hoy.getMonth() - fechaNac.getMonth();
    
    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
      edad--;
    }
    
    return edad;
  } catch (error) {
    console.error('Error al calcular la edad:', error);
    return 'No disponible';
  }
}

// Descargar documento
exports.descargarDocumento = async (req, res) => {
    try {
        const { id } = req.params;
        const tipo = req.query.tipo;
        const numSesion = req.query.numSesion;
        
        console.log('Iniciando descarga, ID:', id, 'Tipo:', tipo, 'Sesión:', numSesion);
        
        // Si es una historia clínica generada dinámicamente
        if ((tipo === 'NUTRICIONAL_V1' || tipo === 'NUTRICIONAL_V2') && numSesion) {
            const idExpediente = req.query.expediente;
            
            if (!idExpediente) {
                return res.status(400).send('ID de expediente requerido');
            }
            
            // Obtener datos del expediente con manejo de errores en desencriptación
            const expediente = await Nutricion.obtenerPorId(idExpediente);
            
            if (!expediente) {
                return res.status(404).send('Expediente no encontrado');
            }
            
            // Obtener datos de la sesión
            const datosSesion = await Nutricion.obtenerDatosSesionCompletos(idExpediente, numSesion);
            
            if (!datosSesion) {
                return res.status(404).send('Sesión no encontrada');
            }
            
            // Desencriptar datos del paciente con manejo de errores
            let nombres, apellidoP, apellidoM, fechaNacimiento, edadPaciente;
            
            try {
                nombres = decrypt(expediente.nombres);
                apellidoP = decrypt(expediente.apellidoP);
                apellidoM = decrypt(expediente.apellidoM);
                fechaNacimiento = decrypt(expediente.fechaNacimiento);
                edadPaciente = calcularEdad(fechaNacimiento);
            } catch (decryptError) {
                console.error('Error al desencriptar datos:', decryptError);
                nombres = `Paciente_${idExpediente}`;
                apellidoP = '';
                apellidoM = '';
                fechaNacimiento = new Date().toISOString().split('T')[0];
                edadPaciente = 'No disponible';
            }
            
            // Crear un nombre descriptivo para el archivo
            const fechaActual = new Date().toISOString().split('T')[0];
            const nombrePaciente = `${apellidoP}_${apellidoM}_${nombres}`
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9]/gi, '_');
            
            const nombreDescarga = `Historia${tipo === 'NUTRICIONAL_V1' ? 'V1' : 'V2'}_${nombrePaciente}_Sesion${numSesion}_${fechaActual}.pdf`;
            
            // Generar el HTML y el PDF como en la implementación original
            let html;
            const templatePath = tipo === 'NUTRICIONAL_V1' 
                ? '../views/pdf/historiaClinicaV1.ejs'
                : '../views/pdf/historiaClinicaV2.ejs';
                
            const datosGeneralesPaciente = { nombres, apellidoP, apellidoM, fechaNacimiento, edadPaciente };
            
            html = await ejs.renderFile(
                path.join(__dirname, templatePath),
                {
                    idExpediente,
                    tipo,
                    expediente,
                    datosSesion,
                    datosGeneralesPaciente,
                    fechaGeneracion: new Date().toLocaleDateString()
                }
            );
            
            // Generar PDF con Puppeteer
            const browser = await puppeteer.launch({
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            const page = await browser.newPage();
            await page.setContent(html, { waitUntil: 'networkidle0' });
            
            const pdfBuffer = await page.pdf({
                format: 'A4',
                margin: {
                    top: "20px",
                    bottom: "20px",
                    left: "20px",
                    right: "20px"
                }
            });
            
            await browser.close();
            
            // Enviar PDF generado
            res.setHeader('Content-Type', 'application/pdf')
               .setHeader('Content-Disposition', `attachment; filename="${nombreDescarga}"`)
               .end(pdfBuffer);
            return;
        }

        // Si es un documento almacenado
        const documento = await Nutricion.obtenerDocumentoPorId(id);
        
        if (!documento) {
            return res.status(404).json({ error: 'Documento no encontrado' });
        }
        
        // Obtener la ruta del archivo (ahora guardada en nombreArchivo)
        let key = documento.nombreArchivo;
        
        if (!key || key.trim() === '') {
            return res.status(404).json({ error: 'Documento sin ubicación válida' });
        }
        
        // Normalizar key para S3
        key = key.replace(/\\/g, '/');
        
        if (key.startsWith('http')) {
            const url = new URL(key);
            key = url.pathname.replace(/^\/+/, '');
        }
        
        try {
            const data = await s3.getObject({
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: key
            }).promise();
            
            // Usar el nombre del documento normalizado
            const nombreArchivo = documento.tipo || 'documento';
            const nombreNormalizado = nombreArchivo
                .trim()
                .replace(/[^\w\s.-]/g, '_')
                .replace(/\s+/g, '_');
            
            res.setHeader('Content-Type', 'application/pdf')
               .setHeader('Content-Disposition', `attachment; filename="${nombreNormalizado}.pdf"`)
               .send(data.Body);
               
        } catch (s3Error) {
            console.error('Error de S3:', s3Error);
            if (s3Error.code === 'NoSuchKey') {
                return res.status(404).json({ error: 'Archivo no encontrado en S3' });
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

// Ver documento (con soporte para S3)
exports.verDocumento = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`Intentando visualizar documento con ID: ${id}`);
        
        // Primero intentar obtener el documento
        const documento = await Nutricion.obtenerDocumentoPorId(id);
        
        if (!documento) {
            console.error(`Documento con ID ${id} no encontrado en la base de datos`);
            return res.status(404).json({
                error: 'Documento no encontrado en la base de datos',
                detalles: 'El documento solicitado no existe en nuestros registros'
            });
        }
        
        // Verificar ubicación en ambos campos posibles
        let rutaArchivo = documento.nombreArchivo;
        
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
            const nombreArchivo = documento.tipo || 'documento';
            
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

// Obtener y mostrar un Historial Nutricional V2
exports.getHistorialNutricionalV2 = async (req, res) => {
    try {
      const id = req.query.id;
      const idExpediente = req.query.expediente;
      
      if (!id || !idExpediente) {
        return res.status(400).send('Se requieren los IDs');
      }
      
      // Obtener datos del historial nutricional V2 (antes objetivo nutricional)
      const historial = await Nutricion.obtenerHistorialNutricionalV2PorId(id);
      
      if (!historial) {
        return res.status(404).send('Historial nutricional V2 no encontrado');
      }
      
      // Obtener datos del paciente
      const pacienteEncriptado = await Nutricion.obtenerPorId(idExpediente);
      
      // Desencriptar datos sensibles del paciente
      const paciente = {
        nombres: decrypt(pacienteEncriptado.nombres || ''),
        apellidoP: decrypt(pacienteEncriptado.apellidoP || ''),
        apellidoM: decrypt(pacienteEncriptado.apellidoM || ''),
        fechaNacimiento: decrypt(pacienteEncriptado.fechaNacimiento || '')
      };
      
      // Renderizar la vista con los datos
      res.render('historial_nutricional_v2', { 
        historial, 
        paciente
      });
    } catch (error) {
      console.error('Error al obtener historial nutricional V2:', error);
      res.status(500).send('Error al cargar el historial nutricional V2');
    }
  };

// Eliminar documento o historial
exports.eliminarDocumento = async (req, res) => {
  try {
      const { id } = req.params;
      const tipo = req.query.tipo; // Obtener el tipo desde query parameters
      console.log(`Intentando eliminar ${tipo || 'elemento'} con ID:`, id);

      // Verificación de seguridad: no permitir eliminar historiales V1
      if (tipo === 'NUTRICIONAL_V1') {
          return res.status(403).json({ error: 'No está permitido eliminar Historiales Nutricionales V1' });
      }

      // Determinar qué eliminar según el tipo
      if (tipo === 'NUTRICIONAL_V2') {
          // Eliminar historial nutricional V2
          await Nutricion.eliminarHistorialV2(id);
          return res.json({ message: 'Historial Nutricional V2 eliminado correctamente' });
      } 
      else if (tipo === 'PDF') {
          // Eliminar documento PDF
          const documento = await Nutricion.obtenerDocumentoPorId(id);
          if (documento) {
              // Verificar si existe el archivo físico (opcional, solo log)
              if (documento.nombreArchivo) {
                  const filePath = path.join(__dirname, '..', documento.nombreArchivo);
                  if (fs.existsSync(filePath)) {
                      console.log('Archivo encontrado pero no eliminado físicamente:', filePath);
                  }
              }
              await Nutricion.eliminarDocumento(id);
              return res.json({ message: 'Documento PDF eliminado correctamente' });
          } else {
              return res.status(404).json({ error: 'Documento no encontrado' });
          }
      } 
      else {
          // Si no se especificó un tipo válido
          return res.status(400).json({ error: 'Tipo de documento no especificado o inválido' });
      }
  } catch (error) {
      console.error('Error al eliminar:', error);
      res.status(500).json({ error: 'Error al eliminar el documento o historial' });
  }
};



// Middleware para subir múltiples documentos a S3
exports.subirMultiplesDocumentosMiddleware = [
    upload.array('archivosDocumento'), 
    async (req, res) => {
      try {
        const { IDExpediente } = req.params;
        console.log('Iniciando subida de múltiples documentos. ID expediente:', IDExpediente);
        
        if (!req.files || req.files.length === 0) {
          return res.status(400).json({ error: 'Debe subir al menos un archivo PDF válido' });
        }
        
        console.log('Archivos recibidos:', req.files.length);
        
        // Obtener datos del paciente
        const expediente = await Nutricion.obtenerPorId(IDExpediente);
        
        if (!expediente) {
          return res.status(404).json({ error: 'Expediente no encontrado' });
        }
        
        // Desencriptar nombres con manejo de errores
        let nombres, apellidoP, apellidoM;
        try {
          nombres = decrypt(expediente.nombres);
          apellidoP = decrypt(expediente.apellidoP);
          apellidoM = decrypt(expediente.apellidoM);
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
            
            // Verificar buffer
            if (!archivo.buffer || archivo.buffer.length === 0) {
              console.error(`Error: El archivo ${archivo.originalname} no tiene un buffer válido`);
              continue;
            }
            
            console.log(`Tamaño del buffer: ${archivo.buffer.length} bytes`);
            
            // Extraer nombre del archivo
            let nombreDocumento = path.basename(archivo.originalname, '.pdf');
            nombreDocumento = nombreDocumento.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g, '_');
            
            // Crear ruta para S3
            const fileKey = `nutricion/${nombreCarpeta}/${Date.now()}_${nombreDocumento.replace(/\s+/g, '_')}.pdf`;
            
            // Subir a S3
            const params = {
              Bucket: process.env.AWS_BUCKET_NAME,
              Key: fileKey,
              Body: archivo.buffer,
              ContentType: 'application/pdf',
            };
            
            await s3.upload(params).promise();
            console.log('Archivo subido a S3 exitosamente');
            
            // Guardar en base de datos
            const nuevoDocumento = await Nutricion.subirDocumento({
                IDExpediente: IDExpediente, // Debe ser mayúscula "ID"
                nombre: nombreDocumento,    // "tipo" → "nombre" 
                ubicacion: fileKey,         // "nombreArchivo" → "ubicacion"
                fecha: new Date(),          // "fechaCreacion" → "fecha"
                eliminado: 0                // Parámetro faltante
              });
            
            resultados.push({
              nombre: nombreDocumento,
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

// Mostrar el formulario de historia clínica con datos del expediente
exports.renderHistoriaClinica = async (req, res) => {
    try {
        const IDExpediente = req.params.id;
        const numSesion = req.query.numSesion;

        if (!IDExpediente || isNaN(parseInt(IDExpediente))) {
            return res.status(400).send('ID del expediente no válido.');
        }

        const expediente = await Nutricion.obtenerPorId(IDExpediente);
        if (!expediente) {
            return res.status(404).send('Expediente no encontrado.');
        }

        let datosSesion = null;
        if (numSesion) {
            datosSesion = await Nutricion.obtenerDatosSesionCompletos(IDExpediente, numSesion);
            if (!datosSesion) {
                return res.status(404).send('Sesión no encontrada.');
            }

            // Asegurarnos que todos los objetos dentro de datosSesion existan
            datosSesion = {
                ...datosSesion,
                nutricional1: datosSesion.nutricional1 || {},
                indicadoresClinicos: datosSesion.indicadoresClinicos || {},
                transtornos: datosSesion.transtornos || {},
                actividadDiaria: datosSesion.actividadDiaria || {},
                diagnosticoEvolucion: datosSesion.diagnosticoEvolucion || {},
                evaluacionAntropometrica: datosSesion.evaluacionAntropometrica || {},
                manejoNutricional: datosSesion.manejoNutricional || {},
                indicadoresBioquim: datosSesion.indicadoresBioquim || [] // Array vacío si no hay indicadores
            };
        }

        res.render('historiaClinica', { 
            expediente, 
            datosSesion,
            modoEdicion: !!numSesion,
            user: req.user
        });
    } catch (error) {
        console.error('Error al renderizar historia clínica:', error);
        res.status(500).send('Error interno al mostrar la historia clínica');
    }
};

exports.guardarHistoriaClinicaV1 = async (req, res) => {
  try {
    const datos = req.body;
    await Nutricion.insertarHistoriaClinicaV1(datos);

    res.json({ success: true });
  } catch (error) {
    console.error('Error guardando datos de historiaclinicav1:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
};

exports.actualizarHistoriaClinicaV1 = async (req, res) => {
    try {
        const datos = req.body;
        await Nutricion.actualizarHistoriaClinicaV1(datos);
        res.json({ success: true });
    } catch (error) {
        console.error('Error actualizando historia clínica:', error);
        res.status(500).json({ success: false, message: 'Error al actualizar' });
    }
};

exports.checkAndRedirectHistoriaClinica = async (req, res) => {
    try {
        const IDExpediente = req.params.id;
        const numSesion = req.query.numSesion;
        const forceV1 = req.query.forceV1 === 'true';
        const editMode = req.query.edit === 'true';

        if (!IDExpediente || isNaN(parseInt(IDExpediente))) {
            return res.status(400).send('ID del expediente no válido.');
        }

        // Si se está intentando editar un V1 existente, ir directamente a edición
        if (editMode) {
            return res.redirect(`/nutricion/historiaClinica/edit/${IDExpediente}?numSesion=${numSesion || ''}`);
        }

        // Si se fuerza V1, ir a creación
        if (forceV1) {
            return res.redirect(`/nutricion/historiaClinica/create/${IDExpediente}`);
        }

        // Verificar si existe una Historia Clínica V1
        const existeV1 = await Nutricion.verificarExistenciaHistoriaV1(IDExpediente);
        
        if (!existeV1) {
            return res.redirect(`/nutricion/historiaClinica/create/${IDExpediente}?forceV1=true`);
        }

        // Si existe V1, redirigir a V2
        res.redirect(`/nutricion/historiaClinicaV2/${IDExpediente}?numSesion=${numSesion || ''}`);
        
    } catch (error) {
        console.error('Error al verificar historia clínica:', error);
        res.status(500).send('Error interno del servidor');
    }
};

exports.guardarHistoriaClinicaV2 = async (req, res) => {
    try {
        const datos = req.body;
        console.log('Datos recibidos en controlador:', datos);

        if (!datos.IDExpediente || !datos.numSesion) {
            return res.status(400).json({
                success: false,
                message: 'ID de expediente y número de sesión son requeridos'
            });
        }

        // Formatear datos según el modelo
        const datosFormateados = {
            IDExpediente: datos.IDExpediente,
            numSesion: datos.numSesion,
            
            // Indicadores bioquímicos
            parametro: datos.parametro,
            valorReferencia: datos.valorReferencia,
            parametroFecha: datos.parametroFecha,
            
            // Evaluación antropométrica
            peso: datos.peso,
            talla: datos.talla,
            circunferenciaCintura: datos.circunferenciaCintura,
            circunferenciaCadera: datos.circunferenciaCadera,
            
            // Diagnóstico
            diagnosticoEvolucion: datos.diagnosticoEvolucion,
            
            // Objetivos nutricionales
            objetivosNutricionales: datos.objetivosNutricionales,
            
            // Manejo nutricional
            energia: datos.energia,
            hidratosDeCarbono: datos.hidratosDeCarbono,
            lipidos: datos.lipidos,
            proteinas: datos.proteinas,
            fibra: datos.fibra,
            agua: datos.agua
        };

        await Nutricion.insertarHistoriaClinicaV2(datosFormateados);
        res.json({ success: true });
    } catch (error) {
        console.error('Error guardando datos de historiaClinicaV2:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Error en el servidor' 
        });
    }
};

// Añadir el método que falta
exports.editHistoriaClinicaV1 = async (req, res) => {
    try {
        const IDExpediente = req.params.id;
        const numSesion = req.query.numSesion;

        if (!IDExpediente || isNaN(parseInt(IDExpediente))) {
            return res.status(400).send('ID del expediente no válido.');
        }

        const expediente = await Nutricion.obtenerPorId(IDExpediente);
        if (!expediente) {
            return res.status(404).send('Expediente no encontrado.');
        }

        // Obtener los datos de la sesión específica
        const datosSesion = await Nutricion.obtenerDatosSesionCompletos(IDExpediente, numSesion);
        if (!datosSesion) {
            return res.status(404).send('Sesión no encontrada.');
        }

        // Renderizar el formulario en modo edición
        res.render('historiaClinica', { 
            expediente, 
            datosSesion,
            modoEdicion: true,
            user: req.user
        });

    } catch (error) {
        console.error('Error al renderizar formulario de edición:', error);
        res.status(500).send('Error interno al mostrar el formulario de edición');
    }
};

// Nuevo controlador específico para crear V1
exports.createHistoriaClinicaV1 = async (req, res) => {
    try {
        const IDExpediente = req.params.id;
        
        if (!IDExpediente || isNaN(parseInt(IDExpediente))) {
            return res.status(400).send('ID del expediente no válido.');
        }

        const expediente = await Nutricion.obtenerPorId(IDExpediente);
        if (!expediente) {
            return res.status(404).send('Expediente no encontrado.');
        }

        // Renderizar el formulario V1 directamente
        res.render('historiaClinica', { 
            expediente, 
            datosSesion: null,
            modoEdicion: false,
            user: req.user
        });

    } catch (error) {
        console.error('Error al renderizar formulario de historia clínica:', error);
        res.status(500).send('Error interno al mostrar el formulario');
    }
};

exports.renderHistoriaClinicaV2 = async (req, res) => {
    try {
        const IDExpediente = req.params.id;
        const numSesion = req.query.numSesion;

        if (!IDExpediente || isNaN(parseInt(IDExpediente))) {
            return res.status(400).send('ID del expediente no válido.');
        }

        const expediente = await Nutricion.obtenerPorId(IDExpediente);
        if (!expediente) {
            return res.status(404).send('Expediente no encontrado.');
        }

        let datosSesion = null;
        if (numSesion) {
            try {
                const [
                    evaluacionAntropometrica,
                    diagnosticoEvolucion,
                    objetivoNutricional,
                    manejoNutricional,
                    indicadoresBioquim
                ] = await Promise.all([
                    Nutricion.obtenerEvaluacionAntropometrica(IDExpediente, numSesion),
                    Nutricion.obtenerDiagnosticoEvolucion(IDExpediente, numSesion),
                    Nutricion.obtenerObjetivosNutricionales(IDExpediente, numSesion),
                    Nutricion.obtenerManejoNutricionalPorSesion(IDExpediente, numSesion),
                    Nutricion.obtenerIndicadoresBioquimicos(IDExpediente, numSesion)
                ]);

                datosSesion = {
                    numSesion,
                    evaluacionAntropometrica: evaluacionAntropometrica || {},
                    diagnosticoEvolucion: diagnosticoEvolucion || {},
                    objetivoNutricional: objetivoNutricional || [],
                    manejoNutricional: manejoNutricional || {},
                    indicadoresBioquim: indicadoresBioquim || []
                };
            } catch (error) {
                console.error('Error al obtener datos de la sesión:', error);
                throw error;
            }
        }

        res.render('historiaClinicaV2', {
            expediente,
            datosSesion,
            user: req.user
        });

    } catch (error) {
        console.error('Error al renderizar historia clínica V2:', error);
        res.status(500).send('Error interno al mostrar la historia clínica V2');
    }
};

// Agregar método para actualizar V2
exports.actualizarHistoriaClinicaV2 = async (req, res) => {
    try {
        const datos = req.body;
        await Nutricion.actualizarHistoriaClinicaV2(datos);
        res.json({ success: true });
    } catch (error) {
        console.error('Error actualizando historia clínica V2:', error);
        res.status(500).json({ success: false, message: 'Error al actualizar' });
    }
};

exports.guardarHistoriaClinica = async (req, res) => {
    try {
        const { IDExpediente, datosSesion } = req.body;

        // Verificar si ya existe un registro en nutricional1 para este expediente
        const existeHistoria = await Nutricion.obtenerHistoriaNutricional1(IDExpediente);

        if (existeHistoria) {
            // Actualizar registro existente en nutricional1
            await Nutricion.actualizarHistoriaNutricional1(IDExpediente, datosSesion.nutricional1);
        } else {
            // Insertar nuevo registro en nutricional1
            await Nutricion.crearHistoriaNutricional1(IDExpediente, datosSesion.nutricional1);
        }

        // Guardar o actualizar las demás tablas (indicadores, manejo nutricional, etc.)
        await Nutricion.guardarIndicadoresBioquimicos(IDExpediente, datosSesion.indicadoresBioquim);
        await Nutricion.guardarManejoNutricional(IDExpediente, datosSesion.manejoNutricional);
        // ...guardar otras tablas según sea necesario...

        res.json({ success: true, message: 'Historia clínica guardada correctamente.' });
    } catch (error) {
        console.error('Error al guardar la historia clínica:', error);
        res.status(500).json({ success: false, message: 'Error al guardar la historia clínica.' });
    }
};
