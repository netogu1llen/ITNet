const Rol = require('../models/rolPriv.model');

/**
 * Obtener y renderizar todos los roles junto con sus privilegios
 */
const get_roles = async (req, res) => {
    try {
        const roles = await Rol.fetchRoles();
        const privilegios = await Rol.fetchPrivilegios(); 

        if (!roles || roles.length === 0) {
            return res.status(404).json({ message: 'No se encontraron roles' });
        }

        if (!privilegios || privilegios.length === 0) {
            return res.status(400).json({ message: 'No se encontraron privilegios' });
        }

        res.render('roles', { roles, privilegios });

    } catch (error) {
        console.error('Error al obtener roles y privilegios:', error);
        res.status(500).send('Error interno del servidor');
    }
};

/**
 * Crear un nuevo rol con sus privilegios asociados
 */
const post_crearRol = async (req, res) => {
    try {
        let { Tipo, actividades = [] } = req.body;
      
        if (!Array.isArray(actividades)) {
            actividades = actividades ? [actividades] : [];
        }

        const yaExiste = await Rol.exists(Tipo);
        if (yaExiste) {
            return res.status(400).json({ error: 'Ya existe un rol con ese nombre.' });
        }

        const IDRol = await Rol.insertRol(Tipo);

        const instanciaRol = new Rol(Tipo);
        await instanciaRol.assignPrivileges(IDRol, actividades);

        res.status(201).json({ message: 'Rol creado exitosamente' });

    } catch (error) {
        console.error('Error al crear el rol:', error.message);
        res.status(500).json({ error: 'Error creando el rol' });
    }
};

/**
 * Obtener rol por ID junto con sus privilegios
 */
const get_rolPorId = async (req, res) => {
    try {
        const IDRol = req.params.id;

        const rol = await Rol.fetchRolByID(IDRol);
        if (!rol) {
            return res.status(404).json({ error: 'Rol no encontrado' });
        }

        const privilegios = await Rol.fetchPrivilegiosPorRol(IDRol);
        res.json({ rol, privilegios });

    } catch (error) {
        console.error('Error al obtener rol por ID:', error.message);
        res.status(500).json({ error: 'Error al obtener el rol' });
    }
};

/**
 * Editar un rol existente y actualizar sus privilegios
 */
const post_editarRol = async (req, res) => {
    try {
        const IDRol = req.params.id;
        let { Tipo, actividades = [] } = req.body;

        if (!Tipo || typeof Tipo !== 'string') {
            return res.status(400).json({ error: 'Tipo de rol inválido' });
        }

        if (!Array.isArray(actividades)) {
            actividades = actividades ? [actividades] : [];
        }

        const rolExistente = await Rol.fetchRolByID(IDRol);
        if (!rolExistente) {
            return res.status(404).json({ error: 'El rol no existe' });
        }
        
	const yaExiste = await Rol.exists(Tipo);
	if (yaExiste && rolExistente.Tipo !== Tipo) {
            return res.status(400).json({ error: 'Ya existe un rol con ese nombre.' });
        }
	
        await Rol.editarTipo(IDRol, Tipo);
        await Rol.eliminarPrivilegios(IDRol);

        const rolActualizado = new Rol(Tipo);
        await rolActualizado.assignPrivileges(IDRol, actividades);

        res.status(200).json({ message: 'Rol actualizado correctamente' });

    } catch (error) {
        console.error('Error al editar el rol:', error.message);
        res.status(500).json({ error: 'Error al editar el rol' });
    }
};

/**
*  Borrado lógico de un rol 
*/
const post_eliminarRol = async (req, res) =>{
    try {
	const IDRol = req.params.id;
	await Rol.borradoLogico(IDRol)
        res.status(200).json({ message: 'Rol eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar el rol:', error.message);
        res.status(500).json({ error: 'Error al eliminar el rol' });
    }
};

module.exports = {
    get_roles,
    post_crearRol,
    get_rolPorId,
    post_editarRol,
    post_eliminarRol
};


