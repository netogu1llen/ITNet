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
    static async getPaciente(idExpediente) {
        try {
            console.log(idExpediente);
            // Usamos el método de promesas para la consulta
            const result = await db.execute(
                'SELECT nombres, apellidoP, apellidoM, numExpediente, fechaNacimiento, contacto, direccion, enfermedades, medicamentos, estudioSocioeconomico, grado, curso, sangre FROM expediente WHERE IDExpediente = ?;',
                [idExpediente]
            );
            return result || [];

        } catch (error) {
            console.error('Error al registrar seguimiento:', error);
            throw new Error('Error al actualizar seguimiento');
        }
    }
    static async editarPaciente({nombres, apellidoP, apellidoM, numExpediente, fechaNacimiento, contacto, direccion, enfermedades, medicamentos, estudioSocioeconomico, grado, curso, sangre, idExpediente}) {
        try {
            // Usamos el método de promesas para la consulta
            const [result] = await db.execute(
                'UPDATE expediente SET nombres= ?, apellidoP = ?, apellidoM = ?, numExpediente = ?, fechaNacimiento = ?, contacto = ?, direccion = ?, enfermedades = ?, medicamentos = ?, estudioSocioeconomico = ?, grado = ?, curso = ?, sangre = ? WHERE IDExpediente= ?',
                [nombres, apellidoP, apellidoM, numExpediente, fechaNacimiento, contacto, direccion, enfermedades, medicamentos, estudioSocioeconomico, grado, curso, sangre, idExpediente]
            );
        } catch (error) {
            console.error('Error al registrar seguimiento:', error);
            throw new Error('Error al actualizar seguimiento');
        }
    }
}
module.exports = Pacientes;