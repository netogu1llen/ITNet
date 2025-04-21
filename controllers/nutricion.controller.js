const Nutricion = require('../models/nutricion.model');
const { decrypt } = require('../util/encryptData');
const path = require('path');
const fs = require('fs');

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
    
    res.render('nutricion', { pacientes: pacientesDesencriptados });
  } catch (error) {
    console.error('Error al obtener la información:', error.message);
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
    // Obtener el ID del expediente de la consulta
    const idExpediente = req.params.id; 
    
    if (!idExpediente) {
      return res.status(400).json({ mensaje: 'Es necesario proporcionar el ID del expediente' });
    }
    
    // Obtener información general del paciente
    const datosGeneralesPacienteEncriptados = await Nutricion.obtenerDatosGenerales(idExpediente);
    
    // Desencriptar datos sensibles
    const datosGeneralesPaciente = {
      nombres: decrypt(datosGeneralesPacienteEncriptados.nombres || ''),
      apellidoP: decrypt(datosGeneralesPacienteEncriptados.apellidoP || ''),
      apellidoM: decrypt(datosGeneralesPacienteEncriptados.apellidoM || ''),
      fechaNacimiento: decrypt(datosGeneralesPacienteEncriptados.fechaNacimiento || ''),
      telefono: decrypt(datosGeneralesPacienteEncriptados.contacto || ''),
      escuela: datosGeneralesPacienteEncriptados.nvEscolar || 'No registrado',
      sexo: datosGeneralesPacienteEncriptados.sexo || 'No especificado',
      edadPaciente: calcularEdad(decrypt(datosGeneralesPacienteEncriptados.fechaNacimiento || ''))
    };
    
    // Obtener antecedentes del paciente
    const antecedentes = await Nutricion.obtenerAntecedentes(idExpediente);
    
    // Obtener manejo nutricional
    const manejoNutricionalData = await Nutricion.obtenerManejoNutricional(idExpediente);
    
    // Obtener documentos y historial nutricional
    const documentosHistorial = await Nutricion.obtenerDocumentosHistorial(idExpediente);
    
    // Formatear fechas para presentación en la vista
    const documentosHistorialFormateados = documentosHistorial.map(item => {
      // Crear copia para no modificar el original
      const formattedItem = { ...item };
      // Formatear la fecha si existe
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
    
    // Datos para la evolución antropométrica (datos de muestra por ahora)
    const evolucionAntropometrica = {
      labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo'],
      datasets: [
        {
          label: 'Peso (kg)',
          data: [60, 59, 58, 57, 56]
        },
        {
          label: 'IMC (kg/m²)',
          data: [24.5, 24.1, 23.7, 23.3, 22.9]
        }
      ]
    };
    
    // Renderizar la vista con todos los datos
    res.render('expediente_nutricion', {
      datosGeneralesPaciente,
      antecedentesHeredofamiliares: antecedentes.heredofamiliares,
      antecedentesPersonales: antecedentes.personales,
      antecedentesAlimentacion: antecedentes.alimentacion,
      manejoNutricional: manejoNutricionalData.manejoNutricional,
      distribucionCalorica: manejoNutricionalData.distribucionCalorica,
      numeroComidas: manejoNutricionalData.numeroComidas,
      imcObjetivo: manejoNutricionalData.imcObjetivo,
      evolucionAntropometrica,
      documentosHistorial: documentosHistorialFormateados
    });
    
  } catch (error) {
    console.error('Error al obtener el expediente nutricional:', error.message);
    res.status(500).send('Error al obtener el expediente nutricional');
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
      const id = req.params.id;

      // Buscar el documento en la base de datos usando el modelo de Nutrición
      let documento = await Nutricion.obtenerDocumentoPorId(id);

      if (!documento) {
          console.error('Documento no encontrado en la base de datos');
          return res.status(404).send('Documento no encontrado');
      }

      // Si se encontró un documento, intentar descargarlo desde el sistema de archivos
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