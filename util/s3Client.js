/**
 * Módulo de cliente para Amazon S3
 * 
 * Configura y exporta una instancia del cliente AWS S3 usando credenciales
 * almacenadas en variables de entorno. Este cliente será reutilizado en toda
 * la aplicación para interactuar con el servicio Amazon S3.
 * 
 * @module s3Client
 * @requires aws-sdk
 */

const AWS = require('aws-sdk');
require('dotenv').config();

/**
 * Instancia configurada del cliente AWS S3.
 * 
 * La configuración se obtiene de las siguientes variables de entorno:
 * - AWS_ACCESS_KEY_ID: Identificador de acceso para AWS IAM
 * - AWS_SECRET_ACCESS_KEY: Clave secreta para AWS IAM
 * - AWS_REGION: Región AWS donde está ubicado el bucket S3
 * 
 * @type {AWS.S3}
 * @constant
 */
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,       // Credencial de acceso AWS
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, // Clave secreta AWS
  region: process.env.AWS_REGION,                   // Región del bucket (ej. 'us-east-1')
});

const testConnection = async () => {
  try {
    await s3.listBuckets().promise();
    console.log('Conexión exitosa a AWS S3');
  } catch (error) {
    console.error('Error al conectar con AWS S3:', error);
  }
};
module.exports = s3;