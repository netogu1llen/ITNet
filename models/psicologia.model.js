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

  // Métodos para actualizar
  exports.actualizarSeguimiento = (id, data, callback) => {
    db.query('UPDATE seguimientopsicologico SET ? WHERE idSeguimiento = ?', [data, id], callback);
  };
  
  exports.eliminarObjetivosPorSeguimientoId = (id, callback) => {
    db.query('DELETE FROM objetivos WHERE idSeguimiento = ?', [id], callback);
  };
  
  exports.insertarObjetivos = (objetivos, callback) => {
    console.log('Insertando objetivos en la base de datos:', objetivos);
    
    const query = 'INSERT INTO objetivos (idSeguimiento, actividad, tiempo, metodologia, objetivo, observaciones) VALUES ?';
    
    const values = objetivos.map(obj => [obj.idSeguimiento, obj.actividad, obj.tiempo, obj.metodologia, obj.objetivo, obj.observaciones]);
  
    db.query(query, [values], (err, result) => {
      if (err) {
        console.error('Error al insertar los objetivos:', err);
        return callback(err);
      }
      callback(null, result);
    });
  };
  