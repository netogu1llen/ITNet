const db = require('../util/database');
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
  