const Rol = require('../models/rolPriv.model');

/**
 * Controlador para obtener y mostrar la lista de roles junto con sus privilegios.
 */
const get_roles = async (req, res) => {
    try {
        const roles = await Rol.fetchRoles();
        const privilegios = await Rol.fetchPrivilegios(); 

        // Validación de contenido
        if (!roles || roles.length === 0) {
            return res.status(404).json({ message: 'No se encontraron roles'});
        }

        if (!privilegios || privilegios.length === 0) {
            return res.status(400).json({ message: 'No se encontraron privilegios' });
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
    let { Tipo, actividades = [] } = req.body;

    if (!Array.isArray(actividades)) {
      actividades = actividades ? [actividades] : [];
    }

    try {
      const yaExiste = await Rol.exists(Tipo);
      if (yaExiste) {
        return res.status(400).send("Ya existe un rol con ese nombre.");
      }

      const rol = new Rol(Tipo);
      await rol.save(actividades);

      res.status(201).json({ message: 'Rol creado exitosamente' });
    } catch (error) {
      console.error('Error al crear el rol:', error.message);
      res.status(500).json({ error: 'Error creando el rol' });
    }

  } catch (error) {
    console.error('Error procesando la petición:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const get_rolPorId = async (req, res) => {
    try {
        const IDRol = req.params.id
	const Rol = await rol.fetchRolByID(IDRol);
	if (!IDRol) {
           return res.status(404).json({error: 'Rol no encontrado'})
	}
        res.json(usuario);
    } catch (error) {
        console.error('Error al obtener rol por ID:', error.message);
	res.status(500).json({ error: 'Error al obtener el rol'});
    }
};


//editar rol 
//const post_editarRol = async (req, res) => {
//    try {
//        let { Tipo, actividades = [] } = req.body;
//
//        if (!Array.isArray(actividades)) {
//            actividades = actividades ? [actividades] : [];
//        }
//	try {
//	    const yaExiste = await Rol.exist(Tipo);
//            if (yaExiste) {
//        	return res.status(400).send('ya existe un rol con ese nombre.');
//	    }
//	    const rol = UPDATE Rol(Tipo);
//	    await rol.editarTipo(Tipo);
//	    await rol.eliminarPrivilegios(IDRol);
//	    await rol.save(actividades);
//	    
//	    res.status(201).json({message: 'Rol editado correctamente.'})
//	} catch (error) {
//	    console.error('Error al editar el rol', error.message);
//	    res.status(500).jason({error: 'Error '});
//        }
//    }catch (error) {
//        console.error('Error procesando la petición:', error.message);
//	res.status(500).json({error: 'Error interno del servidor'})
//    }
//};
//eliminar rol

module.exports = { get_roles, post_crearRol, get_rolPorId };

