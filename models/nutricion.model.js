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
    
    // Obtener datos generales del paciente (sin información del responsable)
    static async obtenerDatosGenerales(idExpediente) {
        try {
            // Datos del paciente - solo usamos la tabla expediente
            const [pacienteRows] = await db.execute(`
                SELECT nombres, apellidoP, apellidoM, fechaNacimiento, contacto, nvEscolar, sexo
                FROM expediente
                WHERE IDExpediente = ? AND (eliminado IS NULL OR eliminado = 0)
            `, [idExpediente]);
            
            if (pacienteRows.length === 0) {
                throw new Error('Paciente no encontrado');
            }
            
            // Devolvemos solo los datos del paciente
            // Se eliminaron todas las referencias a datos de responsable
            return pacienteRows[0];
        } catch (error) {
            throw error;
        }
    }
    
    // Obtener antecedentes del paciente
    static async obtenerAntecedentes(idExpediente) {
        try {
            // Obtener la última sesión de nutricional1
            const [ultimaSesionRows] = await db.execute(`
                SELECT MAX(numSesion) as ultimaSesion
                FROM nutricional1
                WHERE IDExpediente = ?
            `, [idExpediente]);
            
            const ultimaSesion = ultimaSesionRows[0]?.ultimaSesion;
            
            if (!ultimaSesion) {
                return {
                    heredofamiliares: {
                        diabetes: 'No registrado',
                        cancer: 'No registrado',
                        dislipidemia: 'No registrado',
                        obesidad: 'No registrado',
                        anemia: 'No registrado',
                        hipertensionArterial: 'No registrado'
                    },
                    personales: {
                        pesoNacer: 'No registrado',
                        tallaNacer: 'No registrado',
                        sdg: 'No registrado',
                        tipoParto: 'No registrado'
                    },
                    alimentacion: {
                        lactanciaExclusiva: 'No registrado',
                        tiempo: 'No registrado',
                        edadAlimentacionComplementaria: 'No registrado'
                    }
                };
            }
            
            // Obtener datos de nutricional1 con la última sesión
            const [antecedentesRows] = await db.execute(`
                SELECT diabetes, cancer, dislipidemia, obesidad, anemia, hipertensionArterial,
                       pesoNacer, tallaNacer, sdg, tipoParto,
                       lactancia as lactanciaExclusiva, tiempo, edadAlimentacionComplementaria
                FROM nutricional1
                WHERE IDExpediente = ? AND numSesion = ?
            `, [idExpediente, ultimaSesion]);
            
            if (antecedentesRows.length === 0) {
                throw new Error('Antecedentes no encontrados');
            }
            
            // Organizar los datos en diferentes categorías
            const antecedentes = {
                heredofamiliares: {
                    diabetes: antecedentesRows[0].diabetes || 'No registrado',
                    cancer: antecedentesRows[0].cancer || 'No registrado',
                    dislipidemia: antecedentesRows[0].dislipidemia || 'No registrado',
                    obesidad: antecedentesRows[0].obesidad || 'No registrado',
                    anemia: antecedentesRows[0].anemia || 'No registrado',
                    hipertensionArterial: antecedentesRows[0].hipertensionArterial || 'No registrado'
                },
                personales: {
                    pesoNacer: antecedentesRows[0].pesoNacer || 'No registrado',
                    tallaNacer: antecedentesRows[0].tallaNacer || 'No registrado',
                    sdg: antecedentesRows[0].sdg || 'No registrado',
                    tipoParto: antecedentesRows[0].tipoParto || 'No registrado'
                },
                alimentacion: {
                    lactanciaExclusiva: antecedentesRows[0].lactanciaExclusiva || 'No registrado',
                    tiempo: antecedentesRows[0].tiempo || 'No registrado',
                    edadAlimentacionComplementaria: antecedentesRows[0].edadAlimentacionComplementaria || 'No registrado'
                }
            };
            
            return antecedentes;
        } catch (error) {
            throw error;
        }
    }
    
    // Obtener manejo nutricional
    static async obtenerManejoNutricional(idExpediente) {
        try {
            // Obtener la última sesión de manejoNutricional
            const [ultimaSesionRows] = await db.execute(`
                SELECT MAX(numSesion) as ultimaSesion
                FROM manejoNutricional
                WHERE IDExpediente = ?
            `, [idExpediente]);
            
            const ultimaSesion = ultimaSesionRows[0]?.ultimaSesion;
            
            if (!ultimaSesion) {
                return {
                    manejoNutricional: null,
                    distribucionCalorica: '50-20-30 (CHO-P-L)',
                    numeroComidas: '5 comidas/día',
                    imcObjetivo: '18.5-24.9 kg/m²'
                };
            }
            
            // Obtener datos de manejoNutricional
            const [manejoRows] = await db.execute(`
                SELECT energia, proteinas, hidratosDeCarbono, lipidos, fibra, agua
                FROM manejoNutricional
                WHERE IDExpediente = ? AND numSesion = ?
            `, [idExpediente, ultimaSesion]);
            
            // Obtener distribución calórica (de diagnosticoEvolucion)
            const [distCaloricaRows] = await db.execute(`
                SELECT diagnosticoEvolucion
                FROM diagnosticoEvolucion
                WHERE IDExpediente = ?
                ORDER BY numSesion DESC
                LIMIT 1
            `, [idExpediente]);
            
            // Obtener número de comidas (de actividadDiaria)
            const [numComidasRows] = await db.execute(`
                SELECT frecuencia
                FROM actividadDiaria
                WHERE IDExpediente = ?
                ORDER BY numSesion DESC
                LIMIT 1
            `, [idExpediente]);
            
            // Obtener IMC objetivo (de objetivoNutricional)
            const [imcObjetivoRows] = await db.execute(`
                SELECT objetivo
                FROM objetivoNutricional
                WHERE IDExpediente = ?
                ORDER BY numSesion DESC
                LIMIT 1
            `, [idExpediente]);
            
            // Preparar la respuesta
            return {
                manejoNutricional: manejoRows.length > 0 ? manejoRows[0] : null,
                distribucionCalorica: distCaloricaRows.length > 0 ? distCaloricaRows[0].diagnosticoEvolucion : '50-20-30 (CHO-P-L)',
                numeroComidas: numComidasRows.length > 0 ? numComidasRows[0].frecuencia : '5 comidas/día',
                imcObjetivo: imcObjetivoRows.length > 0 ? imcObjetivoRows[0].objetivo : '18.5-24.9 kg/m²'
            };
        } catch (error) {
            throw error;
        }
    }
    // Obtener documentos adjuntos y historial nutricional del paciente
    static async obtenerDocumentosHistorial(idExpediente) {
        try {
            // Obtener documentos adjuntos (PDFs)
            const [documentosRows] = await db.execute(`
                SELECT IDDocumento, nombre, fecha, ubicacion, 'PDF' as tipo
                FROM documentosAdjuntos
                WHERE IDExpediente = ? AND (eliminado IS NULL OR eliminado = 0)
                ORDER BY fecha DESC
            `, [idExpediente]);
            
            // Obtener historial nutricional V1
            const [nutricionalRows] = await db.execute(`
                SELECT IDNutricional1 as ID, 'Historial Nutricional V1' as nombre, 
                    fecha, 'NUTRICIONAL_V1' as tipo, numSesion
                FROM nutricional1
                WHERE IDExpediente = ? AND (eliminado IS NULL OR eliminado = 0)
                ORDER BY fecha DESC
            `, [idExpediente]);
            
            // Combinar ambos resultados
            const documentosHistorial = [
                ...documentosRows.map(doc => ({
                    id: doc.IDDocumento,
                    nombre: doc.nombre,
                    fecha: doc.fecha,
                    tipo: doc.tipo,
                    ruta: doc.ubicacion,
                    numSesion: null
                })),
                ...nutricionalRows.map(hist => ({
                    id: hist.ID,
                    nombre: hist.nombre,
                    fecha: hist.fecha,
                    tipo: hist.tipo,
                    ruta: null,
                    numSesion: hist.numSesion
                }))
            ];
            
            // Ordenar por fecha (más reciente primero)
            documentosHistorial.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
            
            return documentosHistorial;
        } catch (error) {
            throw error;
        }
    }
    
    static async insertarHistoriaClinicaV1(data) {
        const connection = await db.getConnection(); // Aseguramos una sola conexión
        try {
            await connection.beginTransaction(); // Iniciar transacción

            // Insertar en nutricional1
            await connection.execute(`
                INSERT INTO nutricional1 (
                    IDExpediente, numSesion, diabetes, cancer, dislipidemia, obesidad, anemia, hipertensionArterial, 
                    pesoNacer, tallaNacer, alimentacionRecibida, sdg, tipoParto, complicaciones, lactancia, tiempo, 
                    edadAlimentacionComplementaria, alimentosPrimerAnio
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                data.IDExpediente,
                data.numSesion,
                data.diabetes || null,
                data.cancer || null,
                data.dislipidemia || null,
                data.obesidad || null,
                data.anemia || null,
                data.hipertensionArterial || null,
                data.pesoNacer || null,
                data.tallaNacer || null,
                data.alimentacionRecibida || null,
                data.sdg || null,
                data.tipoParto || null,
                data.complicaciones || null,
                data.lactancia || null,
                data.tiempo || null,
                data.edadAlimentacionComplementaria || null,
                data.alimentosPrimerAnio || null
            ]);

            // Insertar en indicadoresClinicos
            await connection.execute(`
                INSERT INTO indicadoresclinicos (
                    IDExpediente, numSesion, cabello, conjunto, unias, boca, dientes, piel, edema
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                data.IDExpediente,
                data.numSesion,
                data.cabello || null,
                data.conjunto || null,
                data.unias || null,
                data.boca || null,
                data.dientes || null,
                data.piel || null,
                data.edema || null
            ]);

            // Insertar en transtornos
            await connection.execute(`
                INSERT INTO transtornos (
                    IDExpediente, numSesion, vomito, reflujo, disfagia, diarrea, flatulencias, estrenimiento, distencion, colitis, pirosis, gastritis, otro
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                data.IDExpediente,
                data.numSesion,
                data.vomito || null,
                data.reflujo || null,
                data.disfagia || null,
                data.diarrea || null,
                data.flatulencias || null,
                data.estrenimiento || null,
                data.distencion || null,
                data.colitis || null,
                data.pirosis || null,
                data.gastritis || null,
                data.otro || null
            ]);

            // Insertar en actividadDiaria
            await connection.execute(`
                INSERT INTO actividaddiaria (
                    IDExpediente, numSesion, ejercicioFisico, fechaInicio, frecuencia
                ) VALUES (?, ?, ?, ?, ?)
            `, [
                data.IDExpediente,
                data.numSesion,
                data.ejercicioFisico || null,
                data.fechaInicio || null,
                data.frecuencia || null
            ]);

            // Insertar en diagnosticoEvolucion
            await connection.execute(`
                INSERT INTO diagnosticoevolucion (
                    IDExpediente, numSesion, diagnosticoEvolucion
                ) VALUES (?, ?, ?)
            `, [
                data.IDExpediente,
                data.numSesion,
                data.diagnosticoEvolucion || null
            ]);

            // Insertar en evaluacionAntropometrica
            await connection.execute(`
                INSERT INTO evaluacionantropometrica (
                    IDExpediente, numSesion, talla, peso, circunferenciaCintura, circunferenciaCadera
                ) VALUES (?, ?, ?, ?, ?, ?)
            `, [
                data.IDExpediente,
                data.numSesion,
                data.talla || null,
                data.peso || null,
                data.circunferenciaCintura || null,
                data.circunferenciaCadera || null
            ]);

            // Insertar en indicadoresBioquimicos (recorrer arrays)
            if (data.parametro && data.valorReferencia && data.parametroFecha) {
                for (let i = 0; i < data.parametro.length; i++) {
                    if (data.parametro[i] && data.valorReferencia[i] && data.parametroFecha[i]) {
                        await connection.execute(`
                            INSERT INTO indicadoresbioquim (
                                IDExpediente, numSesion, parametro, valorReferencia, parametroFecha
                            ) VALUES (?, ?, ?, ?, ?)
                        `, [
                            data.IDExpediente,
                            data.numSesion,
                            data.parametro[i] || null,
                            data.valorReferencia[i] || null,
                            data.parametroFecha[i] || null
                        ]);
                    }
                }
            }

            // Insertar en objetivoNutricional (recorrer array)
            if (data.objetivo) {
                for (let i = 0; i < data.objetivo.length; i++) {
                    if (data.objetivo[i]) {
                        await connection.execute(`
                            INSERT INTO objetivonutricional (
                                IDExpediente, numSesion, objetivo
                            ) VALUES (?, ?, ?)
                        `, [
                            data.IDExpediente,
                            data.numSesion,
                            data.objetivo[i] || null
                        ]);
                    }
                }
            }

            // Insertar en manejoNutricional
            await connection.execute(`
                INSERT INTO manejonutricional (
                    IDExpediente, numSesion, energia, hidratosDeCarbono, lipidos, proteinas, fibra, agua
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                data.IDExpediente,
                data.numSesion,
                data.energia || null,
                data.hidratosDeCarbono || null,
                data.lipidos || null,
                data.proteinas || null,
                data.fibra || null,
                data.agua || null
            ]);

            await connection.commit(); // Confirmar si todo sale bien
            connection.release();
        } catch (error) {
            await connection.rollback(); // Revertir si hay error
            connection.release();
            throw error;
        }
    }
}

module.exports = Nutricion;