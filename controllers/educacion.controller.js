const Educacion = require('../models/educacion.model');
const db = require('../util/database'); // Asegúrate de que esté bien importado

// Vista principal de educación
exports.renderEducacionView = (req, res) => {
  res.render('educacion');
};

// Obtener datos de alumnos
exports.getAlumnosInfo = async (req, res) => {
  try {
    const alumnos = await Educacion.getAlumnos();
    res.json({ data: alumnos });
  } catch (err) {
    console.error('Error al obtener alumnos:', err);
    res.status(500).send('Error al obtener alumnos');
  }
};

// Obtener nombre del alumno desde la tabla expediente
exports.obtenerNombreAlumno = async (IDExpediente) => {
  const [rows] = await db.execute(
    `SELECT CONCAT(nombres, ' ', apellidoP, ' ', apellidoM) AS nombre
     FROM expediente
     WHERE IDExpediente = ?`,
    [IDExpediente]
  );
  return rows.length > 0 ? rows[0].nombre : 'Sin nombre';
};

// ================= MATERIAS =================

exports.renderMaterias = async (req, res) => {
  try {
    const materias = await Educacion.getMaterias();
    res.render('materias', { materias });
  } catch (error) {
    console.error('Error al renderizar vista de materias:', error);
    res.status(500).send('Error interno del servidor');
  }
};

exports.getMateriaById = async (req, res) => {
  try {
    const materia = await Educacion.getMateriaById(req.params.id);
    res.json(materia);
  } catch (error) {
    console.error('Error al obtener materia:', error);
    res.status(500).send('Error interno del servidor');
  }
};

exports.insertMateria = async (req, res) => {
  try {
    await Educacion.insertMateria(req.body);
    res.sendStatus(200);
  } catch (error) {
    console.error('Error al registrar materia:', error);
    res.status(500).send('Error interno del servidor');
  }
};

exports.updateMateria = async (req, res) => {
  try {
    await Educacion.updateMateria(req.body);
    res.sendStatus(200);
  } catch (error) {
    console.error('Error al modificar materia:', error);
    res.status(500).send('Error interno del servidor');
  }
};

exports.deleteMateria = async (req, res) => {
  try {
    await Educacion.deleteMateria(req.body.id);
    res.sendStatus(200);
  } catch (error) {
    console.error('Error al eliminar materia:', error);
    res.status(500).send('Error interno del servidor');
  }
};

exports.obtenerMateria = async (req, res) => {
  try {
    const materia = await Educacion.getMateriaById(req.params.id);
    res.json(materia);
  } catch (error) {
    console.error('Error al obtener materia:', error);
    res.status(500).send('Error interno del servidor');
  }
};

exports.getMateriasList = async (req, res) => {
  try {
    const materias = await Educacion.getMateriasList();
    res.json(materias);
  } catch (error) {
    console.error('Error al obtener lista de materias:', error);
    res.status(500).send('Error interno del servidor');
  }
};

// ================= BOLETAS =================

exports.renderBoletasView = async (req, res) => {
  try {
    const IDExpediente = req.query.idExpediente;
    const nombreAlumno = await Educacion.obtenerNombreAlumno(IDExpediente);
    const boletas = await Educacion.obtenerBoletasPorExpediente(IDExpediente);
    const materias = await Educacion.getMateriasList();

    res.render('boletas', {
      IDExpediente,
      nombreAlumno,
      boletas,
      materias
    });
  } catch (error) {
    console.error('Error al renderizar vista de boletas:', error);
    res.status(500).send('Error interno al mostrar las boletas');
  }
};

exports.registrarBoleta = async (req, res) => {
  try {
    await Educacion.registrarBoleta(req.body);
    res.sendStatus(200);
  } catch (error) {
    console.error('Error al registrar boleta:', error);
    res.status(500).send('Error interno del servidor');
  }
};

exports.obtenerBoletaPorId = async (req, res) => {
  try {
    const data = await Educacion.obtenerBoletaPorId(req.params.id);
    res.json(data);
  } catch (error) {
    console.error('Error al obtener boleta:', error);
    res.status(500).send('Error interno del servidor');
  }
};

exports.modificarBoleta = async (req, res) => {
  try {
    await Educacion.modificarBoleta(req.body);
    res.sendStatus(200);
  } catch (error) {
    console.error('Error al modificar boleta:', error);
    res.status(500).send('Error interno del servidor');
  }
};

exports.eliminarBoleta = async (req, res) => {
  try {
    await Educacion.eliminarBoleta(req.body.id);
    res.sendStatus(200);
  } catch (error) {
    console.error('Error al eliminar boleta:', error);
    res.status(500).send('Error interno del servidor');
  }
};
