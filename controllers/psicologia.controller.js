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

        // Verificar los datos del expediente antes de renderizar la vista
        console.log('Expediente:', expediente);
        console.log('Documentos:', documentos);

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

        const filePath = path.join(__dirname, '..', documento.nombreArchivo);
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

// Subir un documento
exports.subirDocumento = async (req, res) => {
    try {
        const { nombreDocumento } = req.body;
        const { IDExpediente } = req.params; // Obtener ID del expediente desde la URL

        if (!req.file) {
            return res.status(400).json({ error: 'Debe subir un archivo válido.' });
        }

        // Creamos la ruta completa al archivo
        const ubicacion = req.file.path;
        const fecha = new Date(); // Fecha actual
        const eliminado = 0; // Por defecto, no eliminado

        console.log('Subiendo documento:', {
            IDExpediente,
            nombre: nombreDocumento,
            ubicacion,
            fecha
        });

        // Guardar en la base de datos
        const nuevoDocumento = await Psicologia.subirPrueba({
            IDExpediente,
            nombre: nombreDocumento,
            ubicacion,
            fecha,
            eliminado
        });

        res.status(201).json({ message: 'Documento subido correctamente', documento: nuevoDocumento });
    } catch (error) {
        console.error('Error al subir el documento:', error);
        res.status(500).json({ error: 'Error al subir el documento' });
    }
};

// Asegúrate de que está correctamente exportada
exports.verDocumento = async (req, res) => {
    try {
        const documentoId = req.params.id;
        console.log('verDocumento con id:', documentoId);
        
        // Buscar el documento en la base de datos
        const documento = await Psicologia.obtenerDocumentoPorId(documentoId);
        
        if (!documento) {
            console.error('Documento no encontrado en la base de datos');
            return res.status(404).send('Documento no encontrado');
        }
        
        console.log('Documento encontrado:', documento);
        
        // Verificar cómo está almacenada la ruta
        let rutaDocumento;
        if (documento.ubicacion) {
            // Si es una ruta relativa (comienza con 'uploads/')
            if (documento.ubicacion.startsWith('uploads/') || documento.ubicacion.startsWith('uploads\\')) {
                rutaDocumento = path.join(__dirname, '..', documento.ubicacion);
            } else {
                // Si ya es una ruta completa
                rutaDocumento = documento.ubicacion;
            }
        } else {
            // Si no hay una ubicación específica, intenta construir una basada en el ID
            const nombreArchivo = documento.nombreArchivo || `${documentoId}.pdf`;
            rutaDocumento = path.join(__dirname, '..', 'uploads', nombreArchivo);
        }
        
        console.log('Intentando acceder al archivo en:', rutaDocumento);
        
        // Verificar si el archivo existe
        if (fs.existsSync(rutaDocumento)) {
            return res.sendFile(rutaDocumento);
        } else {
            // Verificar si existe en alguna otra ubicación común
            const alternativas = [
                path.join(__dirname, '..', 'uploads', path.basename(rutaDocumento)),
                path.join(__dirname, '..', path.basename(rutaDocumento))
            ];
            
            for (const alt of alternativas) {
                console.log('Intentando ruta alternativa:', alt);
                if (fs.existsSync(alt)) {
                    return res.sendFile(alt);
                }
            }
            
            // Si llega aquí, no encontró el archivo
            console.error('Archivo no encontrado en el sistema de archivos:', rutaDocumento);
            return res.status(404).send('Archivo no encontrado');
        }
    } catch (error) {
        console.error('Error al mostrar documento:', error);
        return res.status(500).send('Error al procesar la solicitud');
    }
};