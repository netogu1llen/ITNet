const db = require('../util/database');
const { decrypt } = require('../util/encryptData');

/** ============================
 *  ALUMNOS / EXPEDIENTES
 *  ============================
 */

/**
 * Obtiene la lista de alumnos con su periodo, grado y curso.
 * @returns {Promise<Array>}
 */
exports.getAlumnos = async () => {
  const [rows] = await db.execute(`
    SELECT 
      e.IDExpediente,
      e.nombres,
      e.apellidoP,
      e.apellidoM,
      (
        SELECT b.periodoEscolar 
        FROM boleta b 
        WHERE b.IDExpediente = e.IDExpediente AND b.eliminado = 0
        ORDER BY b.IDBoleta DESC 
        LIMIT 1
      ) AS periodoEscolar,
      e.grado,
      e.nvEscolar
    FROM expediente e
    WHERE e.eliminado = 0
  `);

  // Desencriptar campos sensibles
  const alumnos = rows.map((alumno) => {
    let nombres = '';
    let apellidoP = '';
    let apellidoM = '';

    try {
      nombres = decrypt(alumno.nombres);
    } catch (e) {
      console.error('Error al desencriptar nombre:', e.message);
      nombres = '[Error]';
    }

    try {
      apellidoP = decrypt(alumno.apellidoP);
    } catch (e) {
      console.error('Error al desencriptar apellido paterno:', e.message);
      apellidoP = '[Error]';
    }

    try {
      apellidoM = decrypt(alumno.apellidoM);
    } catch (e) {
      console.error('Error al desencriptar apellido materno:', e.message);
      apellidoM = '[Error]';
    }

    return {
      IDExpediente: alumno.IDExpediente,
      nombre: `${nombres} ${apellidoP} ${apellidoM}`,
      periodoEscolar: alumno.periodoEscolar,
      grado: alumno.grado,
      nvEscolar: alumno.nvEscolar
    };
  });

  return alumnos;
};

/**
 * Obtiene el nombre completo del alumno por su IDExpediente.
 * @param {number} IDExpediente
 * @returns {Promise<string>}
 */
exports.obtenerNombreAlumno = async (IDExpediente) => {
  const [rows] = await db.execute(
    `
    SELECT nombres, apellidoP, apellidoM
    FROM expediente
    WHERE IDExpediente = ?
  `,
    [IDExpediente]
  );

  if (rows.length === 0) return 'Alumno';

  let nombreCompleto = '';

  try {
    const nombres = decrypt(rows[0].nombres);
    const apellidoP = decrypt(rows[0].apellidoP);
    const apellidoM = decrypt(rows[0].apellidoM);
    nombreCompleto = `${nombres} ${apellidoP} ${apellidoM}`;
  } catch (e) {
    console.error('Error al desencriptar nombre:', e.message);
    nombreCompleto = '[Error de nombre]';
  }

  return nombreCompleto;
};

/** ============================
 *  MATERIAS
 *  ============================
 */

/**
 * Obtiene todas las materias activas.
 * @returns {Promise<Array>}
 */
exports.getMaterias = async () => {
  const [rows] = await db.execute(`
    SELECT * FROM materia 
    WHERE eliminado = 0 OR eliminado IS NULL
  `);
  return rows;
};

/**
 * Obtiene una materia por su ID.
 * @param {number} id
 * @returns {Promise<Object>}
 */
exports.getMateriaById = async (id) => {
  const [rows] = await db.execute(
    `
    SELECT * FROM materia WHERE IDMateria = ?
  `,
    [id]
  );
  return rows[0];
};

/**
 * Inserta una nueva materia.
 * @param {Object} params
 * @param {string} params.materia
 * @param {number} params.grado
 * @param {string} params.nvEscolar
 */
exports.insertMateria = async ({ materia, grado, nvEscolar }) => {
  await db.execute(
    `
    INSERT INTO materia (materia, grado, nvEscolar, eliminado) 
    VALUES (?, ?, ?, 0)
  `,
    [materia, grado, nvEscolar]
  );
};

/**
 * Modifica una materia existente.
 * @param {Object} params
 * @param {number} params.idMateria
 * @param {string} params.materia
 * @param {number} params.grado
 * @param {string} params.nvEscolar
 */
exports.updateMateria = async ({ idMateria, materia, grado, nvEscolar }) => {
  await db.execute(
    `
    UPDATE materia 
    SET materia = ?, grado = ?, nvEscolar = ? 
    WHERE IDMateria = ?
  `,
    [materia, grado, nvEscolar, idMateria]
  );
};

/**
 * Elimina lógicamente una materia.
 * @param {number} id
 */
exports.deleteMateria = async (id) => {
  await db.execute(
    `
    UPDATE materia 
    SET eliminado = 1 
    WHERE IDMateria = ?
  `,
    [id]
  );
};

/**
 * Devuelve una lista con ID y nombre de materias.
 * @returns {Promise<Array>}
 */
exports.getMateriasList = async () => {
  const [rows] = await db.execute(`
    SELECT IDMateria, materia, grado, nvEscolar 
    FROM materia 
    WHERE eliminado = 0 OR eliminado IS NULL
  `);
  return rows;
};

/** ============================
 *  BOLETAS
 *  ============================
 */

/**
 * Obtiene todas las boletas asociadas a un expediente.
 * @param {number} IDExpediente
 * @returns {Promise<Array>}
 */
exports.obtenerBoletasPorExpediente = async (IDExpediente) => {
  const [rows] = await db.execute(
    `
    SELECT 
      b.IDBoleta,
      b.periodoEscolar,
      e.grado,
      e.nvEscolar,
      ROUND(AVG(bm.calificacion), 1) AS promedio
    FROM boleta b
    JOIN expediente e ON b.IDExpediente = e.IDExpediente
    JOIN boletaMateria bm ON bm.IDBoleta = b.IDBoleta
    WHERE b.IDExpediente = ? AND b.eliminado = 0
    GROUP BY b.IDBoleta
  `,
    [IDExpediente]
  );
  return rows;
};

/**
 * Registra una nueva boleta con sus materias.
 * @param {Object} params
 * @param {number} params.IDExpediente
 * @param {string} params.periodoEscolar
 * @param {Array} params.materias
 * @param {Array} params.calificaciones
 */
exports.registrarBoleta = async ({ IDExpediente, periodoEscolar, materias, calificaciones }) => {
  const [result] = await db.execute(
    `
    INSERT INTO boleta (IDExpediente, periodoEscolar, eliminado) 
    VALUES (?, ?, 0)
  `,
    [IDExpediente, periodoEscolar]
  );

  const IDBoleta = result.insertId;

  for (let i = 0; i < materias.length; i++) {
    await db.execute(
      `
      INSERT INTO boletaMateria (IDBoleta, IDMateria, calificacion) 
      VALUES (?, ?, ?)
    `,
      [IDBoleta, materias[i], calificaciones[i]]
    );
  }
};

/**
 * Obtiene una boleta específica por ID, incluyendo sus materias.
 * @param {number} IDBoleta
 * @returns {Promise<Object>}
 */
exports.obtenerBoletaPorId = async (IDBoleta) => {
  const [boletaData] = await db.execute(
    `
    SELECT * FROM boleta WHERE IDBoleta = ?
  `,
    [IDBoleta]
  );

  const [materias] = await db.execute(
    `
    SELECT m.IDMateria, m.materia, bm.calificacion
    FROM boletaMateria bm
    JOIN materia m ON m.IDMateria = bm.IDMateria
    WHERE bm.IDBoleta = ?
  `,
    [IDBoleta]
  );

  return {
    boleta: boletaData[0],
    materias
  };
};

/**
 * Modifica una boleta existente y actualiza sus materias.
 * @param {Object} params
 * @param {number} params.idBoleta
 * @param {string} params.periodoEscolar
 * @param {Array} params.materias
 * @param {Array} params.calificaciones
 */
exports.modificarBoleta = async ({ idBoleta, periodoEscolar, materias, calificaciones }) => {
  await db.execute(
    `
    UPDATE boleta 
    SET periodoEscolar = ? 
    WHERE IDBoleta = ?
  `,
    [periodoEscolar, idBoleta]
  );

  await db.execute(
    `
    DELETE FROM boletaMateria 
    WHERE IDBoleta = ?
  `,
    [idBoleta]
  );

  for (let i = 0; i < materias.length; i++) {
    await db.execute(
      `
      INSERT INTO boletaMateria (IDBoleta, IDMateria, calificacion) 
      VALUES (?, ?, ?)
    `,
      [idBoleta, materias[i], calificaciones[i]]
    );
  }
};

/**
 * Elimina lógicamente una boleta.
 * @param {number} IDBoleta
 */
exports.eliminarBoleta = async (IDBoleta) => {
  await db.execute(
    `
    UPDATE boleta 
    SET eliminado = 1 
    WHERE IDBoleta = ?
  `,
    [IDBoleta]
  );
};
