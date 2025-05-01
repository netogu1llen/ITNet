/**
 * Middleware para verificar si un usuario tiene un privilegio específico
 * 
 * @param {string} permisoRequerido - El privilegio requerido para acceder a la ruta
 * @returns {Function} Middleware de Express para verificar el privilegio
 */
module.exports = (permisoRequerido) => {
  return (req, res, next) => {
    const usuario = req.user;
    
    if (!usuario) {
      return res.status(401).json({ mensaje: 'No autenticado. Se requiere iniciar sesión.' });
    }
    
    const privilegios = usuario.autorizacion?.privilegios;
    
    if (!privilegios || !Array.isArray(privilegios)) {
      return res.status(403).json({ mensaje: 'Acceso denegado: no tienes permisos suficientes.' });
    }
    
    const tienePermiso = privilegios.some(privilegio => {
      if (typeof privilegio === 'string') {
        return privilegio.toLowerCase() === permisoRequerido.toLowerCase();
      }
      return false;
    });
    
    if (tienePermiso) {
      return next();
    } else {
      return res.status(403).json({ mensaje: 'Acceso denegado: no tienes permisos suficientes.' });
    }
  };
};
