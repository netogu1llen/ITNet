const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    database: 'soffy',
    password: 'Gato#4286',
});

module.exports = pool.promise();