const Nutricion = require('../models/nutricion.model');

// Renderiza la vista
exports.obtenerHistoriales = async (req, res) => {
    try {
        const historiales = await Nutricion.obtenerTodos();
        res.render('nutricion', { historiales });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al cargar los historiales clínicos');
    }
};

// Obtener uno por ID
exports.obtenerHistorialPorId = async (req, res) => {
    try {
        const id = req.params.id;
        const historial = await Nutricion.obtenerPorId(id);
        if (!historial) {
            return res.status(404).json({ error: 'No encontrado' });
        }
        res.json(historial);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al buscar historial' });
    }
};

// Modificar
exports.modificarHistorial = async (req, res) => {
    try {
        const id = req.params.id;
        const { numSesion, fecha } = req.body;
        await Nutricion.modificar(id, { numSesion, fecha });
        res.status(200).json({ message: 'Historial modificado' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al modificar historial' });
    }
};
