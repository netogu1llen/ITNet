const Nutricion = require('../models/nutricion.model');
const { decrypt } = require('../util/encryptData');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const ejs = require('ejs');
const puppeteer = require('puppeteer');

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

        // Obtener el expediente completo para tener el ID
        const expediente = await Nutricion.obtenerPorId(idExpediente);

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

        // Obtener antecedentes del paciente
        const antecedentes = await Nutricion.obtenerAntecedentes(idExpediente);

        // Obtener manejo nutricional
        const manejoNutricionalData = await Nutricion.obtenerManejoNutricional(idExpediente);

        // Obtener documentos y historial nutricional
        const documentosHistorial = await Nutricion.obtenerDocumentosHistorial(idExpediente);

        // Obtener sesiones desde nutricional1
        const nutricional1 = await Nutricion.obtenerSesionesNutricional1(idExpediente);

        // Formatear fechas para presentación en la vista
        const documentosHistorialFormateados = documentosHistorial.map(item => {
            const formattedItem = { ...item };
            if (formattedItem.fecha) {
                const fecha = new Date(formattedItem.fecha);
                formattedItem.fechaFormateada = fecha.toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                });
            } else {
                formattedItem.fechaFormateada = 'Sin fecha';
            }
            return formattedItem;
        });

        res.render('expediente_nutricion', {
            expediente, // Añadir el objeto expediente completo
            datosGeneralesPaciente,
            antecedentesHeredofamiliares: antecedentes.heredofamiliares,
            antecedentesPersonales: antecedentes.personales,
            antecedentesAlimentacion: antecedentes.alimentacion,
            manejoNutricional: manejoNutricionalData.manejoNutricional,
            documentosHistorial: documentosHistorialFormateados,
            nutricional1
        });
    } catch (error) {
        console.error('Error al obtener el expediente nutricional:', error.message);
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
// Modificar la función descargarDocumento en controllers/nutricion.controller.js
exports.descargarDocumento = async (req, res) => {
    try {
        const id = req.params.id;
        const tipo = req.query.tipo;
        const numSesion = req.query.numSesion;
        
        // Primero intentar obtener como documento PDF almacenado
        let documento = await Nutricion.obtenerDocumentoPorId(id);

        if (!documento) {
            console.log('No se encontró documento PDF, intentando generar expediente...');
            
            // Determinar el tipo de documento a generar
            if (tipo === 'NUTRICIONAL_V1' || tipo === 'NUTRICIONAL_V2') {
                // Obtener datos para el expediente
                const idExpediente = req.query.expediente; // Nuevo parámetro
                
                if (!idExpediente) {
                    return res.status(400).send('ID de expediente requerido');
                }
                
                // Obtener datos del expediente
                const expediente = await Nutricion.obtenerPorId(idExpediente);
                
                if (!expediente) {
                    return res.status(404).send('Expediente no encontrado');
                }

                // Obtener datos completos de la sesión
                const datosSesion = await Nutricion.obtenerDatosSesionCompletos(idExpediente, numSesion);
                
                if (!datosSesion) {
                    return res.status(404).send('Sesión no encontrada');
                }
                
                // Desencriptar datos del paciente para el PDF
                const datosGeneralesPaciente = {
                    nombres: expediente.nombres,
                    apellidoP: expediente.apellidoP,
                    apellidoM: expediente.apellidoM,
                    fechaNacimiento: expediente.fechaNacimiento,
                    edadPaciente: calcularEdad(expediente.fechaNacimiento)
                };

                // Generar HTML según el tipo de documento
                let html;
                if (tipo === 'NUTRICIONAL_V1') {
                    // Usar plantilla para Historia Clínica V1
                    html = await ejs.renderFile(
                        path.join(__dirname, '../views/pdf/historiaClinicaV1.ejs'),
                        {   
                            idExpediente,
                            tipo,
                            expediente,
                            datosSesion, 
                            datosGeneralesPaciente, 
                            fechaGeneracion: new Date().toLocaleDateString() 
                        }
                    );
                } else if (tipo === 'NUTRICIONAL_V2') {

                    // Usar plantilla para Historia Clínica V2
                    html = await ejs.renderFile(
                        path.join(__dirname, '../views/pdf/historiaClinicaV2.ejs'),
                        {   idExpediente,
                            tipo,
                            expediente,
                            datosSesion, 
                            datosGeneralesPaciente,
                            fechaGeneracion: new Date().toLocaleDateString() 
                        }
                    );
                } else {
                    return res.status(400).send('Tipo de documento no válido');
                }

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

                // Enviar el PDF generado
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `attachment; filename=${tipo === 'NUTRICIONAL_V1' ? 'historial_clinico_v1' : 'historial_clinico_v2'}.pdf`);
                return res.end(pdfBuffer);
            }
        }

        // Si es un documento almacenado, enviarlo desde el sistema de archivos
        const rutaDocumento = path.join(__dirname, '..', documento.nombreArchivo);
        if (fs.existsSync(rutaDocumento)) {
            return res.download(rutaDocumento);
        } else {
            console.error('Archivo no encontrado:', rutaDocumento);
            return res.status(404).send('Archivo no encontrado');
        }

    } catch (error) {
        console.error('Error al procesar la solicitud de descarga:', error);
        return res.status(500).send('Error interno del servidor');
    }
};

// Ver documento
exports.verDocumento = async (req, res) => {
  try {
      const id = req.params.id;
      
      // Obtener información del documento
      const documento = await Nutricion.obtenerDocumentoPorId(id);
      
      if (!documento) {
          return res.status(404).send('Documento no encontrado');
      }
      
      // Construir la ruta del archivo
      const rutaDocumento = path.join(__dirname, '..', documento.nombreArchivo);
      
      // Verificar si el archivo existe
      if (!fs.existsSync(rutaDocumento)) {
          return res.status(404).send('Archivo no encontrado');
      }
      
      // Establecer el tipo MIME correcto para PDF
      res.setHeader('Content-Type', 'application/pdf');
      
      // Enviar el archivo como respuesta
      res.sendFile(rutaDocumento);
  } catch (error) {
      console.error('Error al mostrar documento:', error);
      res.status(500).send('Error al mostrar el documento');
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
          const nuevoDocumento = await Nutricion.subirDocumento({
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
            modoEdicion: !!numSesion 
        });
    } catch (error) {
        console.error('Error al renderizar historia clínica:', error);
        res.status(500).send('Error interno al mostrar la historia clínica');
    }
};

exports.guardarHistoriaClinicaV1 = async (req, res) => {
  try {
    const datos = req.body;
    console.log('Datos recibidos para guardar en historiaclinicav1:', datos);

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
            modoEdicion: true
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
            modoEdicion: false
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
            // Obtener todos los datos relacionados con la sesión
            const evaluacionAntropometrica = await Nutricion.obtenerEvaluacionAntropometrica(IDExpediente, numSesion);
            const diagnosticoEvolucion = await Nutricion.obtenerDiagnosticoEvolucion(IDExpediente, numSesion);
            const objetivoNutricional = await Nutricion.obtenerObjetivosNutricionales(IDExpediente, numSesion);
            const indicadoresBioquim = await Nutricion.obtenerIndicadoresBioquimicos(IDExpediente, numSesion);
            const manejoNutricionalData = await Nutricion.obtenerManejoNutricionalPorSesion(IDExpediente, numSesion);

            datosSesion = {
                numSesion,
                evaluacionAntropometrica: evaluacionAntropometrica[0] || {},
                diagnosticoEvolucion: diagnosticoEvolucion[0] || {},
                objetivoNutricional: objetivoNutricional || [],
                manejoNutricional: manejoNutricionalData || {},
                indicadoresBioquim: indicadoresBioquim || []
            };
        }

        // Para mostrar datos de la última sesión V1
        const ultimaSesionV1 = await Nutricion.obtenerUltimaSesionV1(IDExpediente);

        res.render('historiaClinicaV2', {
            expediente,
            datosSesion,
            datosSesionV1: ultimaSesionV1
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
