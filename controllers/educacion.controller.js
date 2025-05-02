const Educacion = require('../models/educacion.model');

/** =============================
 *  VISTA PRINCIPAL DE EDUCACIÓN
 *  =============================
 */

/**
 * Renderiza la vista principal del módulo de educación.
 * @param {object} req - Objeto de solicitud HTTP.
 * @param {object} res - Objeto de respuesta HTTP.
 */
exports.renderEducacionView = (req, res) => {
  res.render('educacion');
};

/**
 * Obtiene la información de todos los alumnos.
 * @param {object} req
 * @param {object} res
 */
exports.getAlumnosInfo = async (req, res) => {
  try {
    const alumnos = await Educacion.getAlumnos();
    res.json({ data: alumnos });
  } catch (err) {
    console.error('Error al obtener alumnos:', err);
    res.status(500).send('Error al obtener alumnos');
  }
};

/**
 * Obtiene el nombre completo del alumno desde el modelo.
 * @param {number} IDExpediente
 * @returns {Promise<string>}
 */
exports.obtenerNombreAlumno = async (IDExpediente) => {
  return await Educacion.obtenerNombreAlumno(IDExpediente);
};

/** =============================
 *  MATERIAS
 *  =============================
 */

/**
 * Renderiza la vista de materias.
 * @param {object} req
 * @param {object} res
 */
exports.renderMaterias = async (req, res) => {
  try {
    const materias = await Educacion.getMaterias();
    res.render('materias', { materias });
  } catch (error) {
    console.error('Error al renderizar vista de materias:', error);
    res.status(500).send('Error interno del servidor');
  }
};

/**
 * Obtiene una materia por su ID.
 * @param {object} req
 * @param {object} res
 */
exports.getMateriaById = async (req, res) => {
  try {
    const materia = await Educacion.getMateriaById(req.params.id);
    res.json(materia);
  } catch (error) {
    console.error('Error al obtener materia:', error);
    res.status(500).send('Error interno del servidor');
  }
};

/**
 * Inserta una nueva materia.
 * @param {object} req
 * @param {object} res
 */
exports.insertMateria = async (req, res) => {
  try {
    await Educacion.insertMateria(req.body);
    res.sendStatus(200);
  } catch (error) {
    console.error('Error al registrar materia:', error);
    res.status(500).send('Error interno del servidor');
  }
};

/**
 * Modifica una materia existente.
 * @param {object} req
 * @param {object} res
 */
exports.updateMateria = async (req, res) => {
  try {
    await Educacion.updateMateria(req.body);
    res.sendStatus(200);
  } catch (error) {
    console.error('Error al modificar materia:', error);
    res.status(500).send('Error interno del servidor');
  }
};

/**
 * Elimina lógicamente una materia.
 * @param {object} req
 * @param {object} res
 */
exports.deleteMateria = async (req, res) => {
  try {
    await Educacion.deleteMateria(req.body.id);
    res.sendStatus(200);
  } catch (error) {
    console.error('Error al eliminar materia:', error);
    res.status(500).send('Error interno del servidor');
  }
};

/**
 * Obtiene una materia para mostrar en el modal.
 * @param {object} req
 * @param {object} res
 */
exports.obtenerMateria = async (req, res) => {
  try {
    const materia = await Educacion.getMateriaById(req.params.id);
    res.json(materia);
  } catch (error) {
    console.error('Error al obtener materia:', error);
    res.status(500).send('Error interno del servidor');
  }
};

/**
 * Obtiene lista de materias con solo ID y nombre.
 * @param {object} req
 * @param {object} res
 */
exports.getMateriasList = async (req, res) => {
  try {
    const materias = await Educacion.getMateriasList();
    res.json(materias);
  } catch (error) {
    console.error('Error al obtener lista de materias:', error);
    res.status(500).send('Error interno del servidor');
  }
};

/** =============================
 *  BOLETAS
 *  =============================
 */

/**
 * Renderiza la vista de boletas para un alumno específico.
 * @param {object} req
 * @param {object} res
 */
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

/**
 * Registra una nueva boleta y sus materias.
 * @param {object} req
 * @param {object} res
 */
exports.registrarBoleta = async (req, res) => {
  try {
    await Educacion.registrarBoleta(req.body);
    res.sendStatus(200);
  } catch (error) {
    console.error('Error al registrar boleta:', error);
    res.status(500).send('Error interno del servidor');
  }
};

/**
 * Obtiene una boleta específica con sus materias.
 * @param {object} req
 * @param {object} res
 */
exports.obtenerBoletaPorId = async (req, res) => {
  try {
    const data = await Educacion.obtenerBoletaPorId(req.params.id);
    res.json(data);
  } catch (error) {
    console.error('Error al obtener boleta:', error);
    res.status(500).send('Error interno del servidor');
  }
};

/**
 * Modifica una boleta existente.
 * @param {object} req
 * @param {object} res
 */
exports.modificarBoleta = async (req, res) => {
  try {
    console.log('🔧 Datos recibidos en modificarBoleta:', req.body);
    await Educacion.modificarBoleta(req.body);
    res.sendStatus(200);
  } catch (error) {
    console.error('Error al modificar boleta:', error);
    res.status(500).send('Error interno del servidor');
  }
};

/**
 * Elimina lógicamente una boleta.
 * @param {object} req
 * @param {object} res
 */
exports.eliminarBoleta = async (req, res) => {
  try {
    await Educacion.eliminarBoleta(req.body.IDBoleta);
    res.sendStatus(200);
  } catch (error) {
    console.error('Error al eliminar boleta:', error);
    res.status(500).send('Error interno del servidor');
  }
};
