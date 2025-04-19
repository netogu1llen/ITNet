const db = require('../util/database');

class Nutricion {
    // Obtener todos los pacientes (excluyendo los eliminados)
    static async obtenerTodos() {
        try {
            const [results] = await db.execute(`
                SELECT IDExpediente, nombres, apellidoP, apellidoM, fechaNacimiento, nvEscolar
                FROM expediente
                WHERE eliminado IS NULL OR eliminado = 0
            `);
            return results;
        } catch (error) {
            throw error;
        }
    }

    // Obtener un paciente por su ID
    static async obtenerPorId(idExpediente) {
        try {
            const [rows] = await db.execute(`
                SELECT *
                FROM expediente
                WHERE IDExpediente = ? AND (eliminado IS NULL OR eliminado = 0)
            `, [idExpediente]);
            return rows[0]; // Devuelve el primer resultado
        } catch (error) {
            throw error;
        }
    }

    // Eliminar un paciente (marcado como eliminado)
    static async eliminar(idExpediente) {
        try {
            const [result] = await db.execute(`
                UPDATE expediente
                SET eliminado = 1
                WHERE IDExpediente = ?
            `, [idExpediente]);
            return result;
        } catch (error) {
            throw error;
        }
    }
    
    static async insertarHistoriaClinicaV1(data) {
        const [result] = await db.execute(`
          INSERT INTO historiaclinicav1 (
            IDExpediente, diabetes, cancer, dislipidemia, obesidad, anemia, hipertensionArterial,
            pesoNacer, tallaNacer, alimentacionRecibida, sdg, tipoParto, complicaciones,
            lactancia, tiempo, edadAlimentacionComplementaria, alimentosPrimerAnio
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          data.IDExpediente, data.diabetes, data.cancer, data.dislipidemia, data.obesidad, data.anemia, data.hipertensionArterial,
          data.pesoNacer, data.tallaNacer, data.alimentacionRecibida, data.sdg, data.tipoParto, data.complicaciones,
          data.lactancia, data.tiempo, data.edadAlimentacionComplementaria, data.alimentosPrimerAnio
        ]);
      
        return result;
      }
      
      
}

module.exports = Nutricion;