const Usuario = require('../models/usuarios.model');

// Obtener los datos de los usuarios
const obtenerUsuarios = async (req, res) => {
    try {
        const usuarios = await Usuario.obtenerTodos();
        res.render('usuarios', { usuarios });
    } catch (error) {
        console.error('Error al obtener usuarios:', error.message);
        res.status(500).send('Error al obtener los usuarios');
    }
};

// Obtener un usuario por ID
const obtenerUsuarioPorId = async (req, res) => {
    try {
        const idUsuario = req.params.id;
        const usuario = await Usuario.obtenerPorId(idUsuario);
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.json(usuario);
    } catch (error) {
        console.error('Error al obtener usuario por ID:', error.message);
        res.status(500).json({ error: 'Error al obtener el usuario' });
    }
};

// Registrar un nuevo usuario
const registrarUsuario = async (req, res) => {
    try {
        const { nombres, apellidoP, apellidoM, correo, fechaNacimiento } = req.body;
        await Usuario.registrar({ nombres, apellidoP, apellidoM, correo, fechaNacimiento });
        res.status(201).json({ message: 'Usuario registrado correctamente' });
    } catch (error) {
        console.error('Error al registrar usuario:', error.message);
        res.status(500).json({ error: 'Error al registrar el usuario' });
    }
};

// Modificar un usuario existente
const modificarUsuario = async (req, res) => {
    try {
        const idUsuario = req.params.id;
        const { nombres, apellidoP, apellidoM, correo, fechaNacimiento } = req.body;
        await Usuario.modificar(idUsuario, { nombres, apellidoP, apellidoM, correo, fechaNacimiento });
        res.status(200).json({ message: 'Usuario modificado correctamente' });
    } catch (error) {
        console.error('Error al modificar usuario:', error.message);
        res.status(500).json({ error: 'Error al modificar el usuario' });
    }
};

// Eliminar un usuario
const eliminarUsuario = async (req, res) => {
    try {
        const idUsuario = req.params.id;
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