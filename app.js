require('dotenv').config(); // Cargar variables de entorno
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');
const session = require('express-session');
const path = require('path');
const cookieParser = require('cookie-parser');

const jwtSecret = process.env.JWT_SECRET; // Para firmar y verificar JWT
const sessionSecret = process.env.SESSION_SECRET; // Para las sesiones

const app = express();
app.use('/node_modules', express.static('node_modules'));

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", 'https://apis.google.com', 'https://accounts.google.com', "'unsafe-eval'"],
            styleSrc: ["'self'", 'https://cdn.jsdelivr.net', 'https://fonts.googleapis.com', "'unsafe-inline'"],
            imgSrc: ["'self'", 'https://www.google.com'],
            fontSrc: ["'self'", 'https://fonts.gstatic.com'],
            frameSrc: ["'self'", 'https://accounts.google.com'],
            connectSrc: ["'self'", 'https://accounts.google.com'],
            upgradeInsecureRequests: []
        }
    }
}));

// Middleware para permitir solicitudes de diferentes dominios (CORS)
app.use(cors());

// Middleware para comprimir respuestas HTTP
app.use(compression());

// Middleware para registrar solicitudes HTTP (logging)
app.use(morgan('combined'));

// Middleware para servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

//middleware para servir archivos estáticos de la carpeta uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configuración de la vista (EJS)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware para procesar JSON y datos URL-encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Midleware para el uso de cookies en sesión
app.use(cookieParser());

// Middleware de sesión
app.use(session({
    secret: process.env.SESSION_SECRET || 'mySecretKey', // Usa una clave secreta desde .env
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Cambia a true si usas HTTPS
}));

// Middleware para manejar variables de sesión en todas las vistas
app.use((req, res, next) => {
    res.locals.isLoggedIn = req.session.isLoggedIn || false;
    res.locals.permisos = req.session.permisos || [];
    res.locals.usuario = req.session.usuario || {};
    next();
});

// Rutas de usuario
const usuarioRoutes = require('./routes/usuario.routes');
app.use('/usuario', usuarioRoutes);

// Rutas de nutrición
const nutricionRoutes = require('./routes/nutricion.routes');
app.use('/nutricion', nutricionRoutes);

// Rutas de educación
const educacionRoutes = require('./routes/educacion.routes');
app.use('/educacion', educacionRoutes);

// Configuración de rutas
const psicologiaRoutes = require('./routes/psicologia.routes');
app.use('/psicologia', psicologiaRoutes);

// Rutas principaless
const mainRoutes = require('./routes/main.routes');
app.use('/', mainRoutes);

const pdf = require('./routes/pdf.routes');
app.use('/', pdf); 

app.use((req, res, next) => {
    res.setHeader('Content-Type', 'text/css');
    res.setHeader('Content-Type', 'application/javascript');
    next();
  });

// Manejo de errores 404 (Página no encontrada)
app.use((req, res, next) => {
    res.status(404).render('404', {
        pagePrimaryTitle: 'Página no encontrada',
    });
});

// Manejo de errores 500 (Error del servidor)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('500', {
        pagePrimaryTitle: 'Error del Servidor',
    });
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`SoffyApp corriendo en http://localhost:${PORT}`);
});