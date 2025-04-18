const Nutricion = require('../models/nutricion.model');
const { decrypt } = require('../util/encryptData');
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

exports.getExpedienteNutricion= (request, response, next) => {

  const evolucionAntropometrica = {
      labels: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio"],
      datasets: [
          { label: "Talla", data: [100, 102, 104, 106, 108, 110], borderColor: "#40E0D0", fill: false },
          { label: "Peso", data: [100, 98, 99, 101, 103, 104], borderColor: "#9370DB", fill: false },
          { label: "IMC", data: [100, 101, 102, 105, 104, 106], borderColor: "#FFA500", fill: false },
          { label: "Circunferencia cintura", data: [100, 98, 99, 101, 103, 105], borderColor: "#FF6666", fill: false },
          { label: "Circunferencia cadera", data: [100, 99, 100, 102, 104, 106], borderColor: "#1E90FF", fill: false },
          { label: "Índice cintura/cadera", data: [100, 101, 102, 104, 106, 108], borderColor: "#FFA07A", fill: false }
      ]
  };
  const datosGeneralesPaciente = {
      nombres: "Oscar Javier",
      apellidoM: "Villeda",
      apellidoP: "Arteaga",
      responsable: "Reymundo Edmundo", //No se encuentra en la BD
      parentesco: "Primo", //No se encuentra en la BD
      sexo: "Masculino",
      escuela: "Instituto Benito Juarez",
      edadResponsable: 48,
      telefono: 444859617,
      fechaNacimiento: "01 de marzo de 2015",
      edadPaciente: 10
  };
  const antecedentesHeredofamiliares = {
      diabetes: "Madre",
      cancer: "Ninguno",
      dislipidemia: "Abuelo paterno",
      obesidad: "Hermano",
      anemia: "Ninguno",
      hipertensionArterial: "Padre y abuelo materno"
  };
  const antecedentesPersonales = {
      pesoNacer: 3.2,
      tallaNacer: 50,
      sdg: "Abuelo paterno",
      tipoParto: "Vaginal"
  };
  const antecedentesAlimentacion = {
      lactanciaExclusiva: "Mixta",
      tiempo: "6 meses",
      edadAlimentacionComplementaria: "6 meses"
  };
  const sesiones = [
      {
          noSesion: 1,
          fecha: "12 de Marzo de 2025"
      }
  ];
  const data = sesiones;
  const manejoNutricional = {
      energia: 2000,
      hidratosCarbono: 250,
      lipidos: 70,
      proteinas: 30,
      fibra: 30,
      agua: 2500
  };
      response.render('expediente_nutricion', { evolucionAntropometrica, datosGeneralesPaciente, antecedentesHeredofamiliares, antecedentesPersonales, antecedentesAlimentacion, manejoNutricional, data});
};

exports.getNutricionData = (req, res) => {
  const data = Nutricion.getAllHistoriales();
  res.json({ data });
};
