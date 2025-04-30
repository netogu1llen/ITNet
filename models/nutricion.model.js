const db = require('../util/database');
const { decrypt } = require('../util/encryptData');

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

    // Obtener un paciente por su ID con desencriptación
    static async obtenerPorId(idExpediente) {
        try {
            const [rows] = await db.execute(`
                SELECT *
                FROM expediente
                WHERE IDExpediente = ? AND (eliminado IS NULL OR eliminado = 0)
            `, [idExpediente]);

            if (rows.length === 0) {
                throw new Error('Paciente no encontrado');
            }

            const paciente = rows[0];

            // Desencriptar campos sensibles
            return {
                IDExpediente: paciente.IDExpediente,
                nombres: decrypt(paciente.nombres || ''),
                apellidoP: decrypt(paciente.apellidoP || ''),
                apellidoM: decrypt(paciente.apellidoM || ''),
                fechaNacimiento: decrypt(paciente.fechaNacimiento || ''),
                contacto: decrypt(paciente.contacto || ''),
                nvEscolar: paciente.nvEscolar || 'Sin nivel registrado',
                sexo: paciente.sexo || 'No especificado',
                grado: paciente.grado || 'Sin grado' // Añadir esta línea
            };
        } catch (error) {
            console.error('Error al obtener y desencriptar paciente:', error.message);
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
            const [pacienteRows] = await db.execute(`
                SELECT nombres, apellidoP, apellidoM, fechaNacimiento, contacto, nvEscolar, sexo
                FROM expediente
                WHERE IDExpediente = ? AND (eliminado IS NULL OR eliminado = 0)
            `, [idExpediente]);

            if (pacienteRows.length === 0) {
                return null; // Retornar null si no se encuentra el expediente
            }

            return pacienteRows[0];
        } catch (error) {
            console.error('Error al obtener datos generales del paciente:', error.message);
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
                    manejoNutricional: null
                };
            }
            
            // Obtener datos de manejoNutricional
            const [manejoRows] = await db.execute(`
                SELECT energia, proteinas, hidratosDeCarbono, lipidos, fibra, agua
                FROM manejoNutricional
                WHERE IDExpediente = ? AND numSesion = ?
            `, [idExpediente, ultimaSesion]);
            
            // Preparar la respuesta
            return {
                manejoNutricional: manejoRows.length > 0 ? manejoRows[0] : null
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
            
            // Obtener historial clínico V1
            const [nutricionalRows] = await db.execute(`
                SELECT IDNutricional1 as ID, 'Historial Clínico V1' as nombre, 
                    fecha, 'NUTRICIONAL_V1' as tipo, numSesion
                FROM nutricional1
                WHERE IDExpediente = ? AND (eliminado IS NULL OR eliminado = 0)
                ORDER BY fecha DESC
            `, [idExpediente]);
            
            // Actualizar la consulta de objetivos nutricionales (V2)
            const [objetivosRows] = await db.execute(`
                SELECT 
                    o.IDObjetivoNutricional as ID, 
                    'Historial Clínico V2' as nombre,
                    o.fecha,
                    'NUTRICIONAL_V2' as tipo,
                    o.numSesion,
                    o.objetivo
                FROM objetivonutricional o
                WHERE o.IDExpediente = ? AND (o.eliminado IS NULL OR o.eliminado = 0)
                ORDER BY o.fecha DESC
            `, [idExpediente]);
            
            
            // Combinar todos los resultados - Sin ordenar aquí
            const documentosHistorial = [
                ...nutricionalRows.map(hist => ({  // Colocamos los V1 primero en el array
                    id: hist.ID,
                    nombre: hist.nombre,
                    fecha: hist.fecha,
                    tipo: hist.tipo,
                    ruta: null,
                    numSesion: hist.numSesion,
                    orden: 1  // Valor para ordenar en el frontend (prioridad alta)
                })),
                ...documentosRows.map(doc => ({
                    id: doc.IDDocumento,
                    nombre: doc.nombre,
                    fecha: doc.fecha,
                    tipo: doc.tipo,
                    ruta: doc.ubicacion,
                    numSesion: null,
                    orden: 2  // Valor para ordenar (prioridad media)
                })),
                ...objetivosRows.map(obj => ({
                    id: obj.ID,
                    nombre: obj.nombre,
                    fecha: obj.fecha,
                    tipo: obj.tipo,
                    ruta: null,
                    numSesion: obj.numSesion,
                    orden: 3  // Valor para ordenar (prioridad baja)
                }))
            ];
            
            return documentosHistorial;
        } catch (error) {
            throw error;
        }
    }

    // Cambiar de obtenerObjetivoNutricionalPorId a obtenerHistorialNutricionalV2PorId
    static async obtenerHistorialNutricionalV2PorId(IDExpediente, numSesion) {
        const connection = await db.getConnection();
        try {
            // Obtener diagnóstico evolución
            const [diagnosticoEvolucion] = await connection.execute(
                'SELECT diagnosticoEvolucion FROM diagnosticoevolucion WHERE IDExpediente = ? AND numSesion = ?',
                [IDExpediente, numSesion]
            );

            // Obtener objetivos nutricionales
            const [objetivoNutricional] = await connection.execute(
                'SELECT objetivo FROM objetivonutricional WHERE IDExpediente = ? AND numSesion = ?',
                [IDExpediente, numSesion]
            );

            // Resto de las consultas existentes
            const [indicadoresBioquim] = await connection.execute(
                'SELECT parametro, valorReferencia, parametroFecha FROM indicadoresbioquim WHERE IDExpediente = ? AND numSesion = ?',
                [IDExpediente, numSesion]
            );

            const [evaluacionAntropometrica] = await connection.execute(
                'SELECT talla, peso, circunferenciaCintura, circunferenciaCadera FROM evaluacionantropometrica WHERE IDExpediente = ? AND numSesion = ?',
                [IDExpediente, numSesion]
            );

            const [manejoNutricional] = await connection.execute(
                'SELECT energia, hidratosDeCarbono, lipidos, proteinas, fibra, agua FROM manejonutricional WHERE IDExpediente = ? AND numSesion = ?',
                [IDExpediente, numSesion]
            );

            return {
                IDExpediente,
                numSesion,
                indicadoresBioquim,
                evaluacionAntropometrica: evaluacionAntropometrica[0] || {},
                diagnosticoEvolucion: diagnosticoEvolucion[0]?.diagnosticoEvolucion || '',
                objetivo: objetivoNutricional.map(obj => obj.objetivo),
                manejoNutricional: manejoNutricional[0] || {}
            };

        } catch (error) {
            throw error;
        } finally {
            connection.release();
        }
    }

    // Obtener un documento por ID
    static async obtenerDocumentoPorId(id) {
        try {
            const [results] = await db.execute(`
                SELECT IDDocumento AS idDocumento, IDExpediente, nombre AS tipo, fecha AS fechaCreacion, ubicacion AS nombreArchivo
                FROM documentosAdjuntos
                WHERE IDDocumento = ?
            `, [id]);
            return results[0];
        } catch (error) {
            throw error;
        }
    }

    // Eliminar un documento PDF
    static async eliminarDocumento(id) {
        try {
            const [result] = await db.execute(`
                UPDATE documentosAdjuntos
                SET eliminado = 1
                WHERE IDDocumento = ?
            `, [id]);
            return result;
        } catch (error) {
            throw error;
        }
    }

    // Eliminar un historial nutricional V1
    static async eliminarHistorialV1(id) {
        try {
            const [result] = await db.execute(`
                UPDATE nutricional1
                SET eliminado = 1
                WHERE IDNutricional1 = ?
            `, [id]);
            return result;
        } catch (error) {
            throw error;
        }
    }

    // Eliminar un historial nutricional V2
    static async eliminarHistorialV2(id) {
        try {
            const [result] = await db.execute(`
                UPDATE objetivonutricional
                SET eliminado = 1
                WHERE IDObjetivoNutricional = ?
            `, [id]);
            return result;
        } catch (error) {
            throw error;
        }
    }

    // Método para subir documentos
    static async subirDocumento({ IDExpediente, nombre, ubicacion, fecha, eliminado }) {
        try {
            console.log('Insertando en BD:', { IDExpediente, nombre, ubicacion, fecha, eliminado });
            
            const [result] = await db.execute(
                `INSERT INTO documentosAdjuntos (IDExpediente, nombre, ubicacion, fecha, eliminado)
                VALUES (?, ?, ?, ?, ?)`,
                [IDExpediente, nombre, ubicacion, fecha, eliminado]
            );
            return result;
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

            // Insertar en indicadoresBioquim (recorrer arrays)
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

    static async insertarHistoriaClinicaV2(data) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // Insertar indicadores bioquímicos
            if (data.parametro && data.valorReferencia && data.parametroFecha) {
                for (let i = 0; i < data.parametro.length; i++) {
                    if (data.parametro[i] && data.valorReferencia[i] && data.parametroFecha[i]) {
                        await connection.execute(
                            'INSERT INTO indicadoresbioquim (IDExpediente, numSesion, parametro, valorReferencia, parametroFecha) VALUES (?, ?, ?, ?, ?)',
                            [
                                data.IDExpediente, 
                                data.numSesion, 
                                data.parametro[i], 
                                data.valorReferencia[i], 
                                data.parametroFecha[i]
                            ]
                        );
                    }
                }
            }

            // Insertar evaluación antropométrica
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

            // Insertar diagnóstico evolución
            await connection.execute(`
                INSERT INTO diagnosticoevolucion (
                    IDExpediente, numSesion, diagnosticoEvolucion
                ) VALUES (?, ?, ?)
            `, [
                data.IDExpediente,
                data.numSesion,
                data.diagnosticoEvolucion || null
            ]);

            // Insertar objetivos nutricionales
            if (data.objetivo) {
                for (const obj of data.objetivo) {
                    await connection.execute(`
                        INSERT INTO objetivonutricional (
                            IDExpediente, numSesion, objetivo
                        ) VALUES (?, ?, ?)
                    `, [
                        data.IDExpediente,
                        data.numSesion,
                        obj
                    ]);
                }
            }

            // Insertar manejo nutricional
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

            await connection.commit();
            return { success: true };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async actualizarHistoriaClinicaV2(data) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
    
            // Actualizar evaluación antropométrica
            await connection.execute(`
                UPDATE evaluacionantropometrica 
                SET talla = ?, peso = ?, circunferenciaCintura = ?, circunferenciaCadera = ?
                WHERE IDExpediente = ? AND numSesion = ?
            `, [
                data.talla || null,
                data.peso || null,
                data.circunferenciaCintura || null,
                data.circunferenciaCadera || null,
                data.IDExpediente,
                data.numSesion
            ]);
    
            // Actualizar diagnóstico evolución
            await connection.execute(`
                UPDATE diagnosticoevolucion 
                SET diagnosticoEvolucion = ?
                WHERE IDExpediente = ? AND numSesion = ?
            `, [
                data.diagnosticoEvolucion || null,
                data.IDExpediente,
                data.numSesion
            ]);
    
            // Actualizar manejo nutricional
            await connection.execute(`
                UPDATE manejonutricional 
                SET energia = ?, hidratosDeCarbono = ?, lipidos = ?, 
                    proteinas = ?, fibra = ?, agua = ?
                WHERE IDExpediente = ? AND numSesion = ?
            `, [
                data.energia || null,
                data.hidratosDeCarbono || null,
                data.lipidos || null,
                data.proteinas || null,
                data.fibra || null,
                data.agua || null,
                data.IDExpediente,
                data.numSesion
            ]);
    
            // Actualizar indicadores bioquímicos
            // Primero eliminar los existentes
            await connection.execute(
                'DELETE FROM indicadoresbioquim WHERE IDExpediente = ? AND numSesion = ?',
                [data.IDExpediente, data.numSesion]
            );
    
            // Insertar los nuevos indicadores
            if (data.parametro && data.valorReferencia && data.parametroFecha) {
                for (let i = 0; i < data.parametro.length; i++) {
                    if (data.parametro[i] && data.valorReferencia[i] && data.parametroFecha[i]) {
                        await connection.execute(
                            'INSERT INTO indicadoresbioquim (IDExpediente, numSesion, parametro, valorReferencia, parametroFecha) VALUES (?, ?, ?, ?, ?)',
                            [
                                data.IDExpediente,
                                data.numSesion,
                                data.parametro[i],
                                data.valorReferencia[i],
                                data.parametroFecha[i]
                            ]
                        );
                    }
                }
            }
    
            // Actualizar objetivos nutricionales
            // Primero eliminar los existentes
            await connection.execute(
                'DELETE FROM objetivonutricional WHERE IDExpediente = ? AND numSesion = ?',
                [data.IDExpediente, data.numSesion]
            );
    
            // Insertar los nuevos objetivos
            if (data.objetivo) {
                for (const obj of data.objetivo) {
                    await connection.execute(
                        'INSERT INTO objetivonutricional (IDExpediente, numSesion, objetivo) VALUES (?, ?, ?)',
                        [data.IDExpediente, data.numSesion, obj]
                    );
                }
            }
    
            await connection.commit();
            return { success: true };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
    static async obtenerSesionesNutricional1(idExpediente) {
        try {
            const [rows] = await db.execute(`
                SELECT n.numSesion, n.fecha,
                    ea.peso, ea.talla,
                    mn.energia, mn.proteinas, mn.hidratosDeCarbono, 
                    mn.lipidos, mn.fibra, mn.agua
                FROM nutricional1 n
                LEFT JOIN evaluacionantropometrica ea 
                    ON n.IDExpediente = ea.IDExpediente 
                    AND n.numSesion = ea.numSesion
                LEFT JOIN manejonutricional mn 
                    ON n.IDExpediente = mn.IDExpediente 
                    AND n.numSesion = mn.numSesion
                WHERE n.IDExpediente = ? 
                AND (n.eliminado IS NULL OR n.eliminado = 0)
                ORDER BY n.numSesion DESC
            `, [idExpediente]);

            return rows;
        } catch (error) {
            console.error('Error al obtener sesiones nutricionales:', error);
            throw error;
        }
    }

    // Obtener datos completos de una sesión
    static async obtenerDatosSesionCompletos(idExpediente, numSesion) {
        try {
            const [nutricional1] = await db.execute(
                'SELECT * FROM nutricional1 WHERE IDExpediente = ? AND numSesion = ?',
                [idExpediente, numSesion]
            );

            const [indicadoresClinicos] = await db.execute(
                'SELECT * FROM indicadoresclinicos WHERE IDExpediente = ? AND numSesion = ?',
                [idExpediente, numSesion]
            );

            const [transtornos] = await db.execute(
                'SELECT * FROM transtornos WHERE IDExpediente = ? AND numSesion = ?',
                [idExpediente, numSesion]
            );

            const [actividadDiaria] = await db.execute(
                'SELECT * FROM actividaddiaria WHERE IDExpediente = ? AND numSesion = ?',
                [idExpediente, numSesion]
            );

            const [diagnosticoEvolucion] = await db.execute(
                'SELECT * FROM diagnosticoevolucion WHERE IDExpediente = ? AND numSesion = ?',
                [idExpediente, numSesion]
            );

            const [evaluacionAntropometrica] = await db.execute(
                'SELECT * FROM evaluacionantropometrica WHERE IDExpediente = ? AND numSesion = ?',
                [idExpediente, numSesion]
            );

            const [manejoNutricional] = await db.execute(
                'SELECT * FROM manejonutricional WHERE IDExpediente = ? AND numSesion = ?',
                [idExpediente, numSesion]
            );

            const [indicadoresBioquim] = await db.execute(
                'SELECT parametro, valorReferencia, parametroFecha FROM indicadoresBioquim WHERE IDExpediente = ? AND numSesion = ?',
                [idExpediente, numSesion]
            );

            const [objetivoNutricional] = await db.execute(
                'SELECT objetivo FROM objetivonutricional WHERE IDExpediente = ? AND numSesion = ?',
                [idExpediente, numSesion]
            );

            return {
                nutricional1: nutricional1[0] || null,
                indicadoresClinicos: indicadoresClinicos[0] || null,
                transtornos: transtornos[0] || null,
                actividadDiaria: actividadDiaria[0] || null,
                diagnosticoEvolucion: diagnosticoEvolucion[0] || null,
                evaluacionAntropometrica: evaluacionAntropometrica[0] || null,
                manejoNutricional: manejoNutricional[0] || null,
                indicadoresBioquim, // Aquí devolvemos el array completo de indicadores
                objetivoNutricional // Añadir el array de objetivos
            };
        } catch (error) {
            console.error('Error al obtener datos de la sesión:', error);
            throw error;
        }
    }

    // Actualizar historia clínica V1
    static async actualizarHistoriaClinicaV1(data) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // Actualizar cada tabla
            const tablas = [
                { nombre: 'nutricional1', campos: ['diabetes', 'cancer', 'dislipidemia', 'obesidad', 'anemia', 'hipertensionArterial', 'pesoNacer', 'tallaNacer', 'alimentacionRecibida', 'sdg', 'tipoParto', 'complicaciones', 'lactancia', 'tiempo', 'edadAlimentacionComplementaria', 'alimentosPrimerAnio'] },
                { nombre: 'indicadoresclinicos', campos: ['cabello', 'conjunto', 'unias', 'boca', 'dientes', 'piel', 'edema'] },
                { nombre: 'transtornos', campos: ['vomito', 'reflujo', 'disfagia', 'diarrea', 'flatulencias', 'estrenimiento', 'distencion', 'colitis', 'pirosis', 'gastritis', 'otro'] },
                { nombre: 'actividaddiaria', campos: ['ejercicioFisico', 'fechaInicio', 'frecuencia'] },
                { nombre: 'diagnosticoevolucion', campos: ['diagnosticoEvolucion'] },
                { nombre: 'evaluacionantropometrica', campos: ['talla', 'peso', 'circunferenciaCintura', 'circunferenciaCadera'] },
                { nombre: 'manejonutricional', campos: ['energia', 'hidratosDeCarbono', 'lipidos', 'proteinas', 'fibra', 'agua'] }
            ];

            for (const tabla of tablas) {
                const setCampos = tabla.campos.map(campo => `${campo} = ?`).join(', ');
                const valores = [...tabla.campos.map(campo => data[campo]), data.IDExpediente, data.numSesion];
                
                await connection.execute(
                    `UPDATE ${tabla.nombre} SET ${setCampos} WHERE IDExpediente = ? AND numSesion = ?`,
                    valores
                );
            }

            // Actualizar indicadoresBioquim
            // Primero eliminar los registros existentes
            await connection.execute(
                'DELETE FROM indicadoresBioquim WHERE IDExpediente = ? AND numSesion = ?',
                [data.IDExpediente, data.numSesion]
            );

            // Luego insertar los nuevos registros
            if (data.parametro && data.valorReferencia && data.parametroFecha) {
                for (let i = 0; i < data.parametro.length; i++) {
                    await connection.execute(
                        'INSERT INTO indicadoresBioquim (IDExpediente, numSesion, parametro, valorReferencia, parametroFecha) VALUES (?, ?, ?, ?, ?)',
                        [data.IDExpediente, data.numSesion, data.parametro[i], data.valorReferencia[i], data.parametroFecha[i]]
                    );
                }
            }

            // Actualizar objetivoNutricional
            await connection.execute(
                'DELETE FROM objetivonutricional WHERE IDExpediente = ? AND numSesion = ?',
                [data.IDExpediente, data.numSesion]
            );

            if (data.objetivo && Array.isArray(data.objetivo)) {
                for (const objetivo of data.objetivo) {
                    await connection.execute(
                        'INSERT INTO objetivonutricional (IDExpediente, numSesion, objetivo) VALUES (?, ?, ?)',
                        [data.IDExpediente, data.numSesion, objetivo]
                    );
                }
            }

            await connection.commit();
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async verificarExistenciaHistoriaV1(idExpediente) {
        try {
            const [rows] = await db.execute(
                'SELECT COUNT(*) as count FROM nutricional1 WHERE IDExpediente = ? AND (eliminado IS NULL OR eliminado = 0)',
                [idExpediente]
            );
            return rows[0].count > 0;
        } catch (error) {
            console.error('Error al verificar existencia de Historia V1:', error);
            throw error;
        }
    }

    static async obtenerUltimaSesionV1(idExpediente) {
        try {
            const [rows] = await db.execute(
                `SELECT n.*, ea.* 
                 FROM nutricional1 n 
                 LEFT JOIN evaluacionantropometrica ea 
                 ON n.IDExpediente = ea.IDExpediente AND n.numSesion = ea.numSesion 
                 WHERE n.IDExpediente = ? 
                 AND (n.eliminado IS NULL OR n.eliminado = 0) 
                 ORDER BY n.numSesion DESC 
                 LIMIT 1`,
                [idExpediente]
            );
            return rows[0] || null;
        } catch (error) {
            console.error('Error al obtener última sesión V1:', error);
            throw error;
        }
    }
}

module.exports = Nutricion;