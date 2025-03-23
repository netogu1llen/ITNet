/**
 * Módulo para generar un PDF usando PDFKit y subirlo a Amazon S3.
 * Sigue la Guía de Estilo de Google para JavaScript.
 */

const PDFDocument = require('pdfkit');
const AWS = require('aws-sdk');
const stream = require('stream');

// Configuración de AWS S3 usando variables de entorno.
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

/**
 * Genera un PDF con el texto proporcionado y lo sube a un bucket de S3.
 *
 * @param {string} text - El texto que se incluirá en el PDF.
 * @param {string} bucketName - El nombre del bucket de S3 donde se subirá el PDF.
 * @param {string} fileName - El nombre del archivo PDF (sin extensión).
 * @return {Promise<string>} La URL del archivo subido a S3.
 * @throws {Error} Si ocurre un error durante la generación del PDF o la subida a S3.
 */
const generatePdfAndUploadToS3 = async (text, bucketName, fileName) => {
  // Crea un stream de lectura para el PDF.
  const passThrough = new stream.PassThrough();

  // Crea un nuevo documento PDF con PDFKit.
  const doc = new PDFDocument();
  doc.pipe(passThrough); // Conecta el stream de lectura.
  doc.text(text, 100, 100); // Añade el texto al PDF.
  doc.end(); // Finaliza el documento.

  // Parámetros para subir el PDF a S3.
  const params = {
    Bucket: bucketName,
    Key: `${fileName}.pdf`,
    Body: passThrough, // Usa el stream como cuerpo del archivo.
    ContentType: 'application/pdf',
  };

  try {
    // Sube el PDF a S3.
    const data = await s3.upload(params).promise();
    console.log('Archivo subido exitosamente:', data.Location);
    return data.Location; // Retorna la URL del archivo en S3.
  } catch (err) {
    console.error('Error al subir el archivo a S3:', err);
    throw err; // Lanza el error para manejarlo en el llamador.
  }
};

// Ejemplo de uso de la función.
(async () => {
  try {
    const text = 'Hola, este es un PDF generado con PDFKit!';
    const bucketName = 'tu-bucket-s3';
    const fileName = 'archivo';

    const fileUrl = await generatePdfAndUploadToS3(text, bucketName, fileName);
    console.log('PDF subido a:', fileUrl);
  } catch (err) {
    console.error('Error en el proceso:', err);
  }
})();