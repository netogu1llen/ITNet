const { request, response } = require("express");


exports.getHome = (request, response) => {
    response.render('home');
  };
  
exports.getClinicaV2 = (request, response) => {
response.render('clinica');
};

exports.getPacientes = (request, response) => {
response.render('pacientes');
};

exports.getTrabajadores = (request, response) => {
response.render('trabajadores');
};

exports.getHistoriaClinica = (request, response, next) => {
response.render('historiaClinica');
};
