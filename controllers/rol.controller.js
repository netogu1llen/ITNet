const Rol = require('../models/rol.model');

/**
 * Obtiene y muestra la lista de roles disponibles, junto con sus privilegios.
 */
const get_roles = async (req, res) => {
    try {
        const roles = await Rol.fetchAll(); // Método del modelo para obtener solo los nombres de roles
        res.render('roles', { roles }); // Renderiza la vista y pasa los nombres de roles
    } catch (error) {
        console.error('Error al obtener roles:', error.message);
        res.status(500).send('Error al obtener los roles');
    }
};

module.exports = { get_roles};
