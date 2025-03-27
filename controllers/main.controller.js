const { request, response } = require("express");


exports.getHome = (request, response) => {
    response.render('main/home');
  };
  
exports.getClinicaV2 = (request, response) => {
response.render('main/clinica');
};

exports.getPacientes = (request, response) => {
response.render('main/pacientes');
};

exports.getTrabajadores = (request, response) => {
response.render('main/trabajadores');
};
  