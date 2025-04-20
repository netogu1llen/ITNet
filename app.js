require('dotenv').config(); // Cargar variables de entorno
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');
const session = require('express-session');
const path = require('path');
const cookieParser = require('cookie-parser');

const authenticateJWT = require('./middlewares/authenticateJWT');

const jwtSecret = process.env.JWT_SECRET; // Para firmar y verificar JWT
const sessionSecret = process.env.SESSION_SECRET; // Para las sesiones

const app = express();

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: [
                "'self'", 
                'https://apis.google.com', 
                'https://accounts.google.com', 
                'https://cdn.jsdelivr.net',  // Added this
                "'unsafe-eval'"
            ],
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
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
      }      
}));

// Middleware para manejar variables de sesión en todas las vistas
const loadUserFromJWT = require('./middlewares/loadUserFromJWT');
app.use(loadUserFromJWT); // Estará disponible en todas las vistas

//Rutas públicas

//Rutas de auth
const authRoutes = require('./routes/auth.routes');
app.use('/', authRoutes);

// Middleware global para proteger todo lo que sigue
app.use(authenticateJWT);

//Rutas protegidas

//Rutas de rol
const rolRoutes = require('./routes/rol.routes');
app.use('/roles', rolRoutes);

// Rutas de psicologia
const psicologiaRoutes = require('./routes/psicologia.routes');
app.use('/psicologia', psicologiaRoutes);

// Rutas de nutrición
const nutricionRoutes = require('./routes/nutricion.routes');
app.use('/nutricion', nutricionRoutes);

// Rutas de usuarios
const usuariosRoutes = require('./routes/usuarios.routes');
app.use('/usuarios', usuariosRoutes);

const educacionRoutes = require('./routes/educacion.routes');
app.use('/educacion', educacionRoutes);

// Rutas de pacientes
const pacientesRoutes = require('./routes/pacientes.routes');
app.use('/pacientes', pacientesRoutes);

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
