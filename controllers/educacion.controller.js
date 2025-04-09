const Educacion = require('../models/educacion.model');

// Centro Educativo

// Alumnos General
exports.renderEducacionView = (req, res) => {
  res.render('educacion');
};

exports.getAlumnosInfo = async (req, res) => {
  try {
    const alumnos = await Educacion.getAlumnosInfo();
    res.json({ data: alumnos });
  } catch (error) {
    console.error('Error al obtener datos de educación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Boletas
exports.renderBoletasView = (req, res) => {
  res.render('boletas');
};

exports.renderModificarBoletaView = (req, res) => {
  res.render('modificarBoleta');
};

exports.renderRegistrarBoletaView = (req, res) => {
  res.render('registrarBoleta');
};

// Materias
exports.renderMaterias = async (req, res) => {
  try {
    const materias = await Educacion.getMaterias();
    res.render('materias', { materias });
  } catch (error) {
    console.error('Error al mostrar materias:', error);
    res.status(500).send('Error al mostrar materias');
  }
};

// === NUEVAS FUNCIONES PARA MODAL ===

// Obtener materia por ID (para llenar modal)
exports.getMateriaById = async (req, res) => {
  try {
    const materia = await Educacion.getMateriaById(req.params.id);
    res.json(materia);
  } catch (error) {
    console.error('Error al obtener materia:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Registrar materia (modal)
exports.insertMateria = async (req, res) => {
  const { materia, grado, nvEscolar } = req.body;
  try {
    await Educacion.insertMateria({ materia, grado, nvEscolar });
    res.sendStatus(200);
  } catch (error) {
    console.error('Error al registrar materia:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

exports.updateMateria = async (req, res) => {
    const { idMateria, materia, grado, nvEscolar } = req.body;
    try {
      console.log('Datos recibidos para actualizar:', { idMateria, materia, grado, nvEscolar });
  
      await Educacion.updateMateria({
        IDMateria: idMateria,
        materia,
        grado,
        nvEscolar,
      });
  
      res.sendStatus(200);
    } catch (error) {
      console.error('Error al modificar materia:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  };
  
  
// Eliminar materia (modal, borrado lógico)
exports.deleteMateria = async (req, res) => {
  try {
    await Educacion.deleteMateria(req.body.id);
    res.sendStatus(200);
  } catch (error) {
    console.error('Error al eliminar materia:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

exports.obtenerMateria = async (req, res) => {
    try {
      const materia = await Educacion.getMateriaById(req.params.id);
      res.json(materia);
    } catch (error) {
      console.error('Error al obtener materia:', error);
      res.status(500).json({ error: 'Error al obtener materia' });
    }
  };
  