const db = require('../util/database');

// === CENTRO EDUCATIVO ===

// Alumnos General
exports.getAlumnosInfo = async () => {
  const [rows] = await db.query(
    `SELECT 
      e.idExpediente,
      CONCAT(e.nombres, ' ', e.apellidoP, ' ', e.apellidoM) AS nombre,
      e.grado,
      e.curso,
      (
        SELECT b.periodoEscolar
        FROM boleta b
        WHERE b.idExpediente = e.idExpediente
        ORDER BY b.idBoleta DESC
        LIMIT 1
      ) AS periodoEscolar
    FROM expediente e`
  );
  return rows;
};

// === MATERIAS ===

exports.getMaterias = async () => {
  const [rows] = await db.query(`
    SELECT IDMateria, materia, grado, nvEscolar 
    FROM materia 
    WHERE eliminado = 0
  `);
  return rows;
};

exports.getMateriaById = async (id) => {
  const [rows] = await db.query(`
    SELECT * FROM materia WHERE idMateria = ?
  `, [id]);
  return rows[0];
};

exports.insertMateria = async ({ materia, grado, nvEscolar }) => {
  await db.query(`
    INSERT INTO materia (materia, grado, nvEscolar, eliminado)
    VALUES (?, ?, ?, 0)
  `, [materia, grado, nvEscolar]);
};

exports.updateMateria = async ({ IDMateria, materia, grado, nvEscolar }) => {
    await db.query(`
      UPDATE materia
      SET materia = ?, grado = ?, nvEscolar = ?
      WHERE IDMateria = ?
    `, [materia, grado, nvEscolar, IDMateria]);
  };  

exports.deleteMateria = async (id) => {
  await db.query(`
    UPDATE materia SET eliminado = 1 WHERE idMateria = ?
  `, [id]);
};
