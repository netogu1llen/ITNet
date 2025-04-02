const Nutricion = require('../models/nutricion.model');

exports.renderNutricionView = (req, res) => {
  res.render('nutricion');
};

exports.getNutricionData = (req, res) => {
  const data = Nutricion.getAllHistoriales();
  res.json({ data });
};

exports.renderPlanesAlimenticios = (req, res) => {
  res.render('planes_alimenticios');
};

exports.getPlanesAlimenticiosData = (req, res) => {
  const data = Nutricion.getAllPlanesAlimenticios();
  res.json({ data });
};

