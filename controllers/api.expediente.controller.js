const db = require('../util/database');
const { decrypt } = require('../util/encryptData');

/**
 * GET /api/expediente/:idExpediente
 * Devuelve todos los datos del expediente (formato JSON), desencriptados
 */
const getExpedienteGeneral = async (req, res) => {
  try {
    const IDExpediente = req.params.idExpediente;

    const [rows] = await db.execute(`
      SELECT * FROM expediente WHERE IDExpediente = ? AND eliminado = 0
    `, [IDExpediente]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Expediente no encontrado' });
    }

    const e = rows[0];

    // Desencriptar campos sensibles
    const desencriptar = (dato) => {
      try {
        return dato ? decrypt(dato) : '';
      } catch (err) {
        console.error(`Error al desencriptar dato: ${err.message}`);
        return '[Error]';
      }
    };

    const expediente = {
      IDExpediente: e.IDExpediente,
      nombreCompleto: `${desencriptar(e.nombres)} ${desencriptar(e.apellidoP)} ${desencriptar(e.apellidoM)}`.trim(),
      numExpediente: e.numExpediente,
      fechaNacimiento: desencriptar(e.fechaNacimiento),
      contacto: desencriptar(e.contacto),
      estado: desencriptar(e.estado),
      ciudad: desencriptar(e.ciudad),
      calle: desencriptar(e.calle),
      cp: desencriptar(e.cp),
      localidad: desencriptar(e.localidad),
      numCasa: desencriptar(e.numCasa),
      enfermedades: e.enfermedades,
      medicamentos: e.medicamentos,
      estudioSocioeconomico: e.estudioSocioeconomico,
      grado: e.grado,
      nvEscolar: e.nvEscolar,
      sangre: e.sangre
    };

    res.status(200).json({ success: true, expediente });

  } catch (error) {
    console.error('❌ Error al obtener expediente general:', error);
    res.status(500).json({ success: false, message: 'Error al obtener expediente' });
  }
};

module.exports = { getExpedienteGeneral };