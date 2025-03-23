const express = require('express');
const pdfService = require('../util/generatePdfAndUpload');

const router = express.Router();

/**
 * Ruta POST para generar un PDF y subirlo a S3.
 *
 * @name post/generate-pdf
 * @path {POST} /generate-pdf
 * @body {string} text - Texto que se incluirá en el PDF.
 * @body {string} bucketName - Nombre del bucket de S3.
 * @body {string} fileName - Nombre del archivo PDF (sin extensión).
 * @response {Object} success - Indica si la operación fue exitosa.
 * @response {string} fileUrl - URL del archivo subido a S3.
 * @response {Object} error - Mensaje de error en caso de fallo.
 */
router.post('/generate-pdf', async (req, res) => {
  try {
    const { text, bucketName, fileName } = req.body;
    const fileUrl = await pdfService.generatePdfAndUploadToS3(text, bucketName, fileName);
    res.json({ success: true, fileUrl });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;