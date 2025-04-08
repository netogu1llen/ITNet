const Usuario = require('../models/usuarios.model'); // Asegúrate de tener un modelo para usuarios

// Obtener los datos de los usuarios
const obtenerUsuarios = async (req, res) => {
    try {
        const usuarios = await Usuario.obtenerTodos(); // Método del modelo para obtener todos los usuarios
        res.render('usuarios', { usuarios }); // Renderiza la vista y pasa los datos
    } catch (error) {
        console.error('Error al obtener usuarios:', error.message);
        res.status(500).send('Error al obtener los usuarios');
    }
};

// Obtener un usuario por ID
const obtenerUsuarioPorId = async (req, res) => {
    try {
        const idUsuario = req.params.id; // Obtén el ID del usuario desde la URL
        const usuario = await Usuario.obtenerPorId(idUsuario); // Llama al modelo para obtener los datos del usuario
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.json(usuario); // Devuelve los datos del usuario en formato JSON
    } catch (error) {
        console.error('Error al obtener usuario por ID:', error.message);
        res.status(500).json({ error: 'Error al obtener el usuario' });
    }
};


// Registrar un nuevo usuario
const registrarUsuario = async (req, res) => {
    try {
        const { nombreUsuario, numTelefono, fechaNacimiento, contrasena } = req.body;
        await Usuario.registrar({ nombreUsuario, numTelefono, fechaNacimiento, contrasena });
        res.status(201).json({ message: 'Usuario registrado correctamente' });
    } catch (error) {
        console.error('Error al registrar usuario:', error.message);
        res.status(500).json({ error: 'Error al registrar el usuario' });
    }
};

// Modificar un usuario existente
const modificarUsuario = async (req, res) => {
    try {
        const idUsuario = req.params.id; // ID dinámico desde la URL
        const { nombreUsuario, numTelefono, fechaNacimiento, contrasena } = req.body;
        await Usuario.modificar(idUsuario, { nombreUsuario, numTelefono, fechaNacimiento, contrasena });
        res.status(200).json({ message: 'Usuario modificado correctamente' });
    } catch (error) {
        console.error('Error al modificar usuario:', error.message);
        res.status(500).json({ error: 'Error al modificar el usuario' });
    }
};

// Eliminar un usuario
const eliminarUsuario = async (req, res) => {
    try {
        const idUsuario = req.params.id; // ID dinámico desde la URL
        await Usuario.eliminar(idUsuario);
        res.status(200).json({ message: 'Usuario eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar usuario:', error.message);
        res.status(500).json({ error: 'Error al eliminar el usuario' });
    }
};

module.exports = {
    obtenerUsuarios,
    obtenerUsuarioPorId,
    registrarUsuario,
    modificarUsuario,
    eliminarUsuario,
};