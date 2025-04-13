const Rol = require('../models/rolPriv.model');

/**
 * Controlador para obtener y mostrar la lista de roles junto con sus privilegios.
 */
const get_roles = async (req, res) => {
  try {
    const roles = await Rol.fetchRoles();
    const privilegios = await Rol.fetchPrivilegios(); // ← Usamos otra variable

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

module.exports = { get_roles };

