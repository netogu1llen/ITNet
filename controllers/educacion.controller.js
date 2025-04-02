const Educacion = require('../models/educacion.model');

exports.renderEducacionView = (req, res) => {
  res.render('educacion');
};

exports.getEducacionData = (req, res) => {
  const data = Educacion.getAllAlumnos();
  res.json({ data });
};