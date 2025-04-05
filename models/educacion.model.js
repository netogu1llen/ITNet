const db = require('../util/database');

exports.getAlumnosInfo = async () => {
  const [rows] = await db.query(
    `SELECT 
      CONCAT(e.nombres, ' ', e.apellidoP, ' ', e.apellidoM) AS nombre,
      e.grado,
      e.curso,
      b.periodoEscolar
    FROM expediente e
    LEFT JOIN boleta b ON e.idExpediente = b.idExpediente`
  );
  return rows;
};
