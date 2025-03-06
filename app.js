const express = require('express');
const app = express();

const port = 3000;

// Inicia el servidor
app.listen(port, () => {
    console.log(`SoffyApp corriendo en http://localhost:${port}`);
});

// const rutas = require('./routes');

// app.use('/modulo', rutas);
