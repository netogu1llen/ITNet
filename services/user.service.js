const Usuario = require('../models/usuarios.model'); // Asegúrate que este path sea correcto

/**
 * Busca un usuario por email. Si no existe, lo crea.
 * @param {Object} googleUser - Información del usuario devuelta por Google
 * @returns {Object} Usuario encontrado o creado
 */
async function findOrCreateUser(googleUser) {
  const email = googleUser.email;
  const nombreUsuario = googleUser.name || googleUser.given_name;

  // Intenta buscar al usuario por correo
  let usuario = await Usuario.obtenerPorCorreo(email); // Necesitas implementar esto en tu modelo

  if (!usuario) {
    // Si no existe, lo registramos
    await Usuario.registrar({
      nombreUsuario,
      numTelefono: '', // opcional
      fechaNacimiento: null,
      contrasena: '', // No se necesita contraseña en login Google
      correo: email
    });

    // Lo buscamos de nuevo para devolverlo
    usuario = await Usuario.obtenerPorCorreo(email);
  }

  return usuario;
}

module.exports = {
  findOrCreateUser,
};
