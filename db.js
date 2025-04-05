const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost', // Cambia esto si tu servidor no está en localhost
  user: 'root', // Cambia esto por tu usuario de MySQL
  password: 'P4sW0rD', // Cambia esto por tu contraseña de MySQL
  database: 'Soffyapp', // Nombre de la base de datos
});

db.connect((err) => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err);
    return;
  }
  console.log('Conexión a la base de datos establecida');
});

module.exports = db;