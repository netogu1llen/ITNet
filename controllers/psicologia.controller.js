const Psicologia = require('../models/psicologia.model'); // Modelo de psicología
const path = require('path');
const fs = require('fs');

// Listar documentos de un expediente
exports.obtenerDocumentosPorExpediente = async (req, res) => {
    try {
        const { idExpediente } = req.params;

        // Obtener documentos de ambas tablas
        const documentosAdjuntos = await Psicologia.obtenerDocumentosAdjuntos(idExpediente);
        const seguimientosPsicologicos = await Psicologia.obtenerSeguimientosPsicologicos(idExpediente);

        // Combinar los resultados
        const documentos = [...documentosAdjuntos, ...seguimientosPsicologicos];

        // Obtener datos del expediente (dinámicamente)
        const expediente = await Psicologia.obtenerExpedientePorId(idExpediente);

        if (!expediente) {
            return res.status(404).json({ error: 'Expediente no encontrado' });
        }

        // Renderizar la vista con los datos dinámicos
        res.render('expedientePsicologico', {
            expediente,
            documentos
        });
    } catch (error) {
        console.error('Error al obtener documentos:', error);
        res.status(500).json({ error: 'Error al obtener documentos' });
    }
};

// Registrar un nuevo documento
exports.registrarDocumento = async (req, res) => {
    try {
        const { idExpediente, tipo, fechaCreacion, nombreArchivo } = req.body;

        // Registrar el documento en la base de datos
        const nuevoDocumento = await Psicologia.registrarDocumento({
            idExpediente,
            tipo,
            fechaCreacion,
            nombreArchivo
        });

        res.status(201).json({ message: 'Documento registrado correctamente', documento: nuevoDocumento });
    } catch (error) {
        console.error('Error al registrar documento:', error);
        res.status(500).json({ error: 'Error al registrar documento' });
    }
};

// Descargar un documento
exports.descargarDocumento = async (req, res) => {
    try {
        const { id } = req.params;

        // Obtener el documento por ID
        const documento = await Psicologia.obtenerDocumentoPorId(id);

        if (!documento) {
            return res.status(404).json({ error: 'Documento no encontrado' });
        }

        const filePath = path.join(__dirname, '../uploads', documento.nombreArchivo);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'Archivo no encontrado en el servidor' });
        }

        res.download(filePath, documento.nombreArchivo);
    } catch (error) {
        console.error('Error al descargar documento:', error);
        res.status(500).json({ error: 'Error al descargar documento' });
    }
};

// Eliminar un documento
exports.eliminarDocumento = async (req, res) => {
    try {
        const { id } = req.params;

        // Obtener el documento por ID
        const documento = await Psicologia.obtenerDocumentoPorId(id);

        if (!documento) {
            return res.status(404).json({ error: 'Documento no encontrado' });
        }

        const filePath = path.join(__dirname, '../uploads', documento.nombreArchivo);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath); // Elimina el archivo del servidor
        }

        // Eliminar el documento de la base de datos
        await Psicologia.eliminarDocumento(id);

        res.json({ message: 'Documento eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar documento:', error);
        res.status(500).json({ error: 'Error al eliminar documento' });
    }
};