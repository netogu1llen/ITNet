const Rol = require('../models/rolPriv.model');

/**
 * Controlador para obtener y mostrar la lista de roles junto con sus privilegios.
 */
const get_roles = async (req, res) => {
    try {
	console.log('hola');    
        const roles = await Rol.fetchRoles();
        const privilegios = await Rol.fetchPrivilegios(); 

        // Validación de contenido
        if (!roles || roles.length === 0) {
            return res.status(404).send('No se encontraron roles');
        }

        if (!privilegios || privilegios.length === 0) {
            return res.status(404).send('No se encontraron privilegios');
        }

        // Renderizar vista con los datos
        res.render('roles', { roles, privilegios });

    } catch (error) {
        console.error('Error al obtener roles y privilegios:', error);
        res.status(500).send('Error interno del servidor');
    }
};

// Crear un nuevo rol y asignar privilegios
const post_crearRol = async (req, res) => {
    try {
	console.log(req.body);    
        const { Tipo, actividades = [] } = req.body;
        if (!Array.isArray(actividades)) {
            actividades = actividades ? [actividades] : [];
        }

        const rol = new Rol(Tipo);
        await rol.save(actividades);

        res.status(200).json({ message: 'Rol creado exitosamente' });
    } catch (error) {
        console.error('Error al crear el rol:', error.message);
        res.status(500).json({ error: 'Error creando el rol' });
    }
};

module.exports = { get_roles, post_crearRol };

