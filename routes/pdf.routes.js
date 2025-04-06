const express = require('express');
const router = express.Router();
const { generatePdfAndUploadToS3 } = require('../util/generatePdfAndUpload');
/**
 * Ruta POST para generar un PDF a partir de texto y subirlo a Amazon S3
 * 
 * Esta ruta:
 * 1. Recibe texto y nombre de archivo en el cuerpo de la solicitud
 * 2. Valida los parámetros requeridos
 * 3. Genera un PDF con el texto proporcionado
 * 4. Sube el PDF al bucket S3 configurado
 * 5. Retorna la URL pública del archivo subido
 * 
 * @route POST /upload
 * @param {Object} req - Objeto de solicitud de Express
 * @param {string} req.body.text - Contenido textual para generar el PDF
 * @param {string} req.body.fileName - Nombre deseado para el archivo PDF (sin extensión)
 * @param {Object} res - Objeto de respuesta de Express
 * @returns {Object} JSON con la URL del PDF subido o mensaje de error
 */
router.post('/upload', async (req, res) => {
    // Extraer parámetros del cuerpo de la solicitud
    const { text, fileName } = req.body;
  
    // Validar parámetros requeridos
    if (!text || !fileName) {
      return res.status(400).json({ error: 'Faltan parámetros' }); // Código 400 Bad Request
    }
  
    try {
      // Obtener nombre del bucket desde variables de entorno
      const bucketName = process.env.S3_BUCKET_NAME;
      
      /**
       * Generar PDF y subir a S3
       * @function generatePdfAndUploadToS3
       * @param {string} text - Texto para el PDF
       * @param {string} bucketName - Nombre del bucket S3
       * @param {string} fileName - Nombre base del archivo
       * @returns {Promise<string>} URL pública del archivo subido
       */
      const url = await generatePdfAndUploadToS3(text, bucketName, fileName);
      
      // Retornar URL con código 200 OK
      res.status(200).json({ url });
      
    } catch (error) {
      console.error('Error al subir PDF:', error); // Log detallado para debugging
      
      // Error 500 Internal Server Error para fallos inesperados
      res.status(500).json({ 
        error: 'Error al generar o subir el PDF',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  module.exports = router;