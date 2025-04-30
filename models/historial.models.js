// models/historial.model.js
const pool = require('../config/database');

const obtenerHistorialExpedientes = async () => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        e.IDExpediente,
        e.nombres AS nombrePaciente,
        ue.fecha AS fechaCreacion,
        ue.IDUsuario AS creadoPor,
        e.fechaModificacion,
        e.modificadoPor
      FROM expediente e
      LEFT JOIN usuarioExpediente ue ON e.IDExpediente = ue.IDExpediente
    `);
    return rows;
  } catch (error) {
    console.error('Error en obtenerHistorialExpedientes:', error);
    throw error;
  }
};

module.exports = {
  obtenerHistorialExpedientes
};
