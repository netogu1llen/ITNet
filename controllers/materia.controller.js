// Simulación de una base de datos temporal
let materias = [
  { id: '1', nombre: 'Español', nivel: 'Secundaria', grado: '1' },
  { id: '2', nombre: 'Matemáticas', nivel: 'Primaria', grado: '3' }
];

// Mostrar formulario para registrar
exports.renderRegistrarMateriaView = (req, res) => {
  res.render('registrarMateria');
};

// Guardar nueva materia
exports.crearMateria = (req, res) => {
  const { nombreMateria, nivelEscolar, grado } = req.body;
  const nuevaMateria = {
    id: (materias.length + 1).toString(),
    nombre: nombreMateria,
    nivel: nivelEscolar,
    grado
  };
  materias.push(nuevaMateria);
  res.redirect('/materia');
};

// Mostrar formulario para modificar usando ?id=1
exports.renderModificarMateriaView = (req, res) => {
  const id = req.query.id;
  const materia = materias.find(m => m.id === id);

  if (!materia) {
    return res.status(404).send('Materia no encontrada');
  }

  res.render('modificarMateria', { materia });
};

// Guardar cambios de la materia
exports.actualizarMateria = (req, res) => {
  const { id, nombreMateria, nivelEscolar, grado } = req.body;

  const index = materias.findIndex(m => m.id === id);
  if (index === -1) {
    return res.status(404).send('Materia no encontrada');
  }

  materias[index] = {
    id,
    nombre: nombreMateria,
    nivel: nivelEscolar,
    grado
  };

  res.redirect('/materia');
};
