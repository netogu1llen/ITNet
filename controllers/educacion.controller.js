const Educacion = require('../models/educacion.model');

exports.renderEducacionView = (req, res) => {
  res.render('educacion');
};

exports.getAlumnosInfo = async (req, res) => {
    try {
      const alumnos = await Educacion.getAlumnosInfo();
      res.json({ data: alumnos });
    } catch (error) {
      console.error('Error al obtener datos de educación:', error); // <- Asegúrate de tener esto
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  };
  

exports.renderBoletasView = (req, res) => {
    res.render('boletas');
  };
  
  exports.getBoletasData = (req, res) => {
    const data = Educacion.getAllBoletas();
    res.json({ data });
  };
 
  exports.renderMateriasView = (req, res) => {
    res.render('materias');
  };
  
  exports.getMateriasData = (req, res) => {
    const data = Educacion.getAllMaterias();
    res.json({ data });
  };


  exports.renderRegistrarBoletaView = (req, res) => {
    const materias = Educacion.getAllMateriasReg();
    res.render('registrarBoleta', { materias });
  };

exports.renderRegistrarMateriaView = (req, res) => {
  res.render('registrarMateria');
};

exports.renderModificarMateriaView = (req, res) => {
  res.render('modificarMateria');
};
  