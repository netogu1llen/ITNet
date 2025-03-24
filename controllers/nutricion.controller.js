const NutricionModel = require('../models/nutricion.model');

const obtenerHistoriales = async (req, res) => {
    const filtros = {
        usuario: req.query.usuario || '',
        fecha: req.query.fecha || '',
        tipo: req.query.tipo || ''
    };

    try {
        const historiales = await NutricionModel.obtenerHistorialesNutricion(filtros);
        res.json(historiales);
    } catch (error) {
        console.error('Error al obtener historiales de nutrición:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

module.exports = { obtenerHistoriales };
