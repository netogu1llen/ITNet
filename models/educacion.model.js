const db = require('../util/database');

/** ============================
 *  ALUMNOS / EXPEDIENTES
 *  ============================
 */

/**
 * Obtiene la lista de alumnos con su periodo, grado y curso.
 */
exports.getAlumnos = async () => {
  const [rows] = await db.execute(`
    SELECT 
      e.IDExpediente,
      CONCAT(e.nombres, ' ', e.apellidoP, ' ', e.apellidoM) AS nombre,
      (
        SELECT b.periodoEscolar 
        FROM boleta b 
        WHERE b.IDExpediente = e.IDExpediente AND b.eliminado = 0
        ORDER BY b.IDBoleta DESC 
        LIMIT 1
      ) AS periodoEscolar,
      e.grado,
      e.nvEscolar
    FROM expediente e
    WHERE e.eliminado = 0
  `);
  return rows;
};

/**
 * Obtiene el nombre completo del alumno por su IDExpediente.
 */
exports.obtenerNombreAlumno = async (IDExpediente) => {
  const [rows] = await db.execute(`
    SELECT CONCAT(nombres, ' ', apellidoP, ' ', apellidoM) AS nombreCompleto
    FROM expediente
    WHERE IDExpediente = ?
  `, [IDExpediente]);
  return rows[0]?.nombreCompleto || 'Alumno';
};

/** ============================
 *  MATERIAS
 *  ============================
 */

exports.getMaterias = async () => {
  const [rows] = await db.execute(`
    SELECT * FROM materia 
    WHERE eliminado = 0 OR eliminado IS NULL
  `);
  return rows;
};

exports.getMateriaById = async (id) => {
  const [rows] = await db.execute(`
    SELECT * FROM materia WHERE IDMateria = ?
  `, [id]);
  return rows[0];
};

exports.insertMateria = async ({ materia, grado, nvEscolar }) => {
  await db.execute(`
    INSERT INTO materia (materia, grado, nvEscolar, eliminado) 
    VALUES (?, ?, ?, 0)
  `, [materia, grado, nvEscolar]);
};

exports.updateMateria = async ({ idMateria, materia, grado, nvEscolar }) => {
  await db.execute(`
    UPDATE materia 
    SET materia = ?, grado = ?, nvEscolar = ? 
    WHERE IDMateria = ?
  `, [materia, grado, nvEscolar, idMateria]);
};

exports.deleteMateria = async (id) => {
  await db.execute(`
    UPDATE materia 
    SET eliminado = 1 
    WHERE IDMateria = ?
  `, [id]);
};

exports.getMateriasList = async () => {
  const [rows] = await db.execute(`
    SELECT IDMateria, materia 
    FROM materia 
    WHERE eliminado = 0 OR eliminado IS NULL
  `);
  return rows;
};

/** ============================
 *  BOLETAS
 *  ============================
 */

/**
 * Obtiene todas las boletas asociadas a un expediente.
 */
exports.obtenerBoletasPorExpediente = async (IDExpediente) => {
  const [rows] = await db.execute(`
    SELECT 
      b.IDBoleta,
      b.periodoEscolar,
      e.grado,
      e.curso,
      ROUND(AVG(bm.calificacion), 1) AS promedio
    FROM boleta b
    JOIN expediente e ON b.IDExpediente = e.IDExpediente
    JOIN boletaMateria bm ON bm.IDBoleta = b.IDBoleta
    WHERE b.IDExpediente = ? AND b.eliminado = 0
    GROUP BY b.IDBoleta
  `, [IDExpediente]);
  return rows;
};

/**
 * Registra una nueva boleta con sus materias.
 */
exports.registrarBoleta = async ({ IDExpediente, periodoEscolar, materias, calificaciones }) => {
  const [result] = await db.execute(`
    INSERT INTO boleta (IDExpediente, periodoEscolar, eliminado) 
    VALUES (?, ?, 0)
  `, [IDExpediente, periodoEscolar]);

  const IDBoleta = result.insertId;

  for (let i = 0; i < materias.length; i++) {
    await db.execute(`
      INSERT INTO boletaMateria (IDBoleta, IDMateria, calificacion) 
      VALUES (?, ?, ?)
    `, [IDBoleta, materias[i], calificaciones[i]]);
  }
};

/**
 * Obtiene una boleta específica por ID, incluyendo sus materias.
 */
exports.obtenerBoletaPorId = async (IDBoleta) => {
  const [boletaData] = await db.execute(`
    SELECT * FROM boleta WHERE IDBoleta = ?
  `, [IDBoleta]);

  const [materias] = await db.execute(`
    SELECT m.IDMateria, m.materia, bm.calificacion
    FROM boletaMateria bm
    JOIN materia m ON m.IDMateria = bm.IDMateria
    WHERE bm.IDBoleta = ?
  `, [IDBoleta]);

  return { boleta: boletaData[0], materias };
};

/**
 * Modifica una boleta existente y actualiza sus materias.
 */
exports.modificarBoleta = async ({ idBoleta, periodoEscolar, materias, calificaciones }) => {
  await db.execute(`
    UPDATE boleta 
    SET periodoEscolar = ? 
    WHERE IDBoleta = ?
  `, [periodoEscolar, idBoleta]);

  await db.execute(`
    DELETE FROM boletaMateria 
    WHERE IDBoleta = ?
  `, [idBoleta]);

  for (let i = 0; i < materias.length; i++) {
    await db.execute(`
      INSERT INTO boletaMateria (IDBoleta, IDMateria, calificacion) 
      VALUES (?, ?, ?)
    `, [idBoleta, materias[i], calificaciones[i]]);
  }
};

/**
 * Elimina lógicamente una boleta.
 */
exports.eliminarBoleta = async (IDBoleta) => {
  await db.execute(`
    UPDATE boleta 
    SET eliminado = 1 
    WHERE IDBoleta = ?
  `, [IDBoleta]);
};
