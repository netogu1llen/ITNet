const Educacion = require('../models/educacion.model');

exports.renderEducacionView = (req, res) => {
  res.render('educacion');
};

exports.getEducacionData = (req, res) => {
  const data = Educacion.getAllAlumnos();
  res.json({ data });
};

exports.renderBoletasView = (req, res) => {
    res.render('boletas');
  };
  
  exports.getBoletasData = (req, res) => {
    const data = Educacion.getAllBoletas();
    res.json({ data });
  };

exports.renderRegistrarMateriaView = (req, res) => {
  res.render('registrarMateria');
};

exports.renderModificarMateriaView = (req, res) => {
  res.render('modificarMateria');
};
  