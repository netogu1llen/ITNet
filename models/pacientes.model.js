const { response } = require('express');
const db = require('../util/database');
class Pacientes {
    static async registrarPaciente({nombres, apellidoP, apellidoM, numExpediente, fechaNacimiento, contacto, direccion, enfermedades, medicamentos, estudioSocioeconomico, grado, curso, sangre}) {
        try {
            // Usamos el método de promesas para la consulta
            const [result] = await db.execute(
                'INSERT INTO expediente SET nombres= ?, apellidoP = ?, apellidoM = ?, numExpediente = ?, fechaNacimiento = ?, contacto = ?, direccion = ?, enfermedades = ?, medicamentos = ?, estudioSocioeconomico = ?, grado = ?, curso = ?, sangre = ?, eliminado = 0',
                [nombres, apellidoP, apellidoM, numExpediente, fechaNacimiento, contacto, direccion, enfermedades, medicamentos, estudioSocioeconomico, grado, curso, sangre]
            );
        } catch (error) {
            console.error('Error al registrar seguimiento:', error);
            throw new Error('Error al actualizar seguimiento');
        }
    }
}
module.exports = Pacientes;