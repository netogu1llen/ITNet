const Nutricion = require('../models/nutricion.model');

exports.renderNutricionView = (req, res) => {
  res.render('nutricion');
};

exports.getNutricionData = (req, res) => {
  const data = Nutricion.getAllHistoriales();
  res.json({ data });
};
