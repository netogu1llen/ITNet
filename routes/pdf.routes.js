const express = require('express');
const router = express.Router();
const s3 = require('../utils/s3Client');
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

/**
 * Endpoint para descargar un archivo PDF desde Amazon S3
 * 
 * Esta ruta:
 * 1. Recibe el nombre del archivo (sin extensión) como parámetro de URL
 * 2. Construye la clave completa del objeto en S3 (añadiendo .pdf)
 * 3. Descarga el archivo desde el bucket configurado
 * 4. Configura los headers apropiados para forzar la descarga
 * 5. Sirve el contenido binario del PDF
 * 
 * @route GET /download/:filename
 * @param {Object} req - Objeto de solicitud de Express
 * @param {string} req.params.filename - Nombre base del archivo PDF (sin extensión)
 * @param {Object} res - Objeto de respuesta de Express
 * @returns {Buffer} Contenido binario del PDF o mensaje de error
 */
  router.get('/download/:filename', async (req, res) => {
    // Extraer nombre de archivo de los parámetros de ruta
    const fileName = req.params.filename;
  
    // Configurar parámetros para la solicitud a S3
    const params = {
      Bucket: process.env.S3_BUCKET_NAME, // Bucket obtenido de variables de entorno
      Key: `${fileName}.pdf`, // Añade extensión .pdf al nombre del archivo
    };
  
    try {
      // Obtener el objeto desde S3
      const data = await s3.getObject(params).promise();
  
      // Configurar headers de respuesta
      res.setHeader('Content-Type', 'application/pdf'); // Tipo MIME correcto
      res.setHeader(
        'Content-Disposition', // Fuerza la descarga en el navegador
        `attachment; filename="${fileName}.pdf"` // Nombre sugerido para el archivo descargado
      );
  
      // Enviar el contenido binario del PDF
      res.send(data.Body);
      
    } catch (err) {
      console.error('Error al descargar el PDF:', err);
      
      // Manejo de errores específicos (opcionalmente podrías diferenciar entre 404 y otros errores)
      if (err.code === 'NoSuchKey') {
        res.status(404).json({ error: 'Archivo no encontrado' });
      } else {
        res.status(500).json({ error: 'Error al descargar el archivo' });
      }
    }
  });

  module.exports = router;