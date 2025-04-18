const Usuario = require('../models/usuarios.model');
const { encrypt, decrypt } = require('../util/encryptData');

// Función para encriptar datos sensibles
const encriptarDatosUsuario = (datosUsuario) => {
    try {
        const datosEncriptados = { ...datosUsuario };
        
        if (datosUsuario.nombres) {
            datosEncriptados.nombres = encrypt(datosUsuario.nombres).encryptedData;
        }
        
        if (datosUsuario.apellidoP) {
            datosEncriptados.apellidoP = encrypt(datosUsuario.apellidoP).encryptedData;
        }
        
        if (datosUsuario.apellidoM) {
            datosEncriptados.apellidoM = encrypt(datosUsuario.apellidoM).encryptedData;
        }
        
        // No encriptar el correo, mantenerlo como texto plano
        if (datosUsuario.correo) {
            datosEncriptados.correo = datosUsuario.correo;
        }
        
        if (datosUsuario.fechaNacimiento) {
            datosEncriptados.fechaNacimiento = encrypt(datosUsuario.fechaNacimiento).encryptedData;
        }
        
        return datosEncriptados;
    } catch (error) {
        console.error('Error al encriptar datos de usuario:', error);
        return datosUsuario; // Devolver datos originales si hay error
    }
};

// Función para desencriptar datos sensibles
const desencriptarDatosUsuario = (datosUsuario) => {
    try {
        const datosDesencriptados = { ...datosUsuario };
        
        if (datosUsuario.nombres) {
            datosDesencriptados.nombres = decrypt(datosUsuario.nombres);
        }
        
        if (datosUsuario.apellidoP) {
            datosDesencriptados.apellidoP = decrypt(datosUsuario.apellidoP);
        }
        
        if (datosUsuario.apellidoM) {
            datosDesencriptados.apellidoM = decrypt(datosUsuario.apellidoM);
        }
        
        // No desencriptar el correo, ya está en texto plano
        // if (datosUsuario.correo) {
        //     datosDesencriptados.correo = decrypt(datosUsuario.correo);
        // }
        
        if (datosUsuario.fechaNacimiento) {
            datosDesencriptados.fechaNacimiento = decrypt(datosUsuario.fechaNacimiento);
        }
        console.log("Fecha de nacimiento desencriptada:", datosDesencriptados.fechaNacimiento);
        return datosDesencriptados;
    } catch (error) {
        console.error('Error al desencriptar datos de usuario:', error);
        return datosUsuario; // Devolver datos originales si hay error
    }
};

// Obtener los datos de los usuarios
const obtenerUsuarios = async (req, res) => {
    try {
        let usuarios = await Usuario.obtenerTodos();
        const roles = await Usuario.obtenerRoles();
        
        // Desencriptar los datos de cada usuario
        usuarios = usuarios.map(usuario => desencriptarDatosUsuario(usuario));
        
        res.render('usuarios', { usuarios, roles });
    } catch (error) {
        console.error('Error al obtener usuarios:', error.message);
        res.status(500).send('Error al obtener los usuarios');
    }
};

// Obtener un usuario por ID
const obtenerUsuarioPorId = async (req, res) => {
    try {
        const idUsuario = req.params.id;
        let usuario = await Usuario.obtenerPorId(idUsuario);
        
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        
        // Desencriptar datos del usuario
        usuario = desencriptarDatosUsuario(usuario);
        
        res.json(usuario);
    } catch (error) {
        console.error('Error al obtener usuario por ID:', error.message);
        res.status(500).json({ error: 'Error al obtener el usuario' });
    }
};

// Registrar un nuevo usuario
const registrarUsuario = async (req, res) => {
    try {
        const { nombres, apellidoP, apellidoM, correo, fechaNacimiento, idRol } = req.body;
        
        // Encriptar datos antes de guardarlos
        const datosEncriptados = encriptarDatosUsuario({ 
            nombres, apellidoP, apellidoM, correo, fechaNacimiento 
        });
        
        // Registrar usuario y obtener el ID generado
        const resultado = await Usuario.registrar(datosEncriptados);
        const idUsuario = resultado.insertId;
        
        // Asignar rol si se seleccionó uno
        if (idRol && idRol !== "0") {
            await Usuario.asignarRol(idUsuario, idRol);
        }
        
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
        const { nombres, apellidoP, apellidoM, correo, fechaNacimiento, idRol } = req.body;
        
        // Encriptar datos antes de actualizarlos
        const datosEncriptados = encriptarDatosUsuario({ 
            nombres, apellidoP, apellidoM, correo, fechaNacimiento 
        });
        
        await Usuario.modificar(idUsuario, datosEncriptados);
        
        // Actualizar rol si se proporcionó uno
        if (idRol) {
            await Usuario.asignarRol(idUsuario, idRol);
        }
        
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

// Verificar si un correo ya existe en la base de datos
const verificarCorreoExistente = async (req, res) => {
    try {
        const { correo, idUsuario } = req.body;
        
        // Verificar si el correo ya existe, excluyendo al usuario actual en caso de modificación
        const existe = await Usuario.verificarCorreoExistente(correo, idUsuario);
        
        res.status(200).json({ existe });
    } catch (error) {
        console.error('Error al verificar correo:', error.message);
        res.status(500).json({ error: 'Error al verificar el correo' });
    }
};

const cambiarRolUsuario = async (req, res) => {
    try {
        const idUsuario = req.params.id;
        const { idRol } = req.body;
        
        if (!idRol) {
            return res.status(400).json({ error: 'Se requiere un rol válido' });
        }
        
        await Usuario.asignarRol(idUsuario, idRol);
        res.status(200).json({ message: 'Rol actualizado correctamente' });
    } catch (error) {
        console.error('Error al cambiar rol de usuario:', error.message);
        res.status(500).json({ error: 'Error al actualizar el rol' });
    }
};

// Y añadir al objeto de exportación
module.exports = {
    obtenerUsuarios,
    obtenerUsuarioPorId,
    registrarUsuario,
    modificarUsuario,
    eliminarUsuario,
    verificarCorreoExistente,
    cambiarRolUsuario
};