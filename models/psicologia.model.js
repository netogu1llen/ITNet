const db = require('../db');

exports.obtenerPorId = (id, callback) => {
  db.query('SELECT * FROM seguimientopsicologico WHERE idSeguimiento = ?', [id], (err, results) => {
    if (err) return callback(err);

    if (results.length === 0) {
      return callback(null, null);
    }

    callback(null, results[0]);
  });
};

exports.obtenerObjetivosPorSeguimientoId = (id, callback) => {
    db.query('SELECT * FROM objetivos WHERE idSeguimiento = ?', [id], callback);
  };
  
// Obtener los datos del expediente
exports.obtenerExpedientePorSeguimientoId = (idSeguimiento, callback) => {
    const sql = `
      SELECT e.nombres, e.apellidoP, e.apellidoM, e.numExpediente, e.fechaNacimiento, 
             e.direccion, e.grado, e.curso
      FROM expediente e
      JOIN seguimientopsicologico s ON e.idExpediente = s.idExpediente
      WHERE s.idSeguimiento = ?
    `;
    db.query(sql, [idSeguimiento], (err, results) => {
      if (err) return callback(err);
      callback(null, results[0]);
    });
  };
  