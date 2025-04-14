const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    database: 'soffy2',
    password: 'P4sW0rD',
});

module.exports = pool.promise();
