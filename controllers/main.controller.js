const { request, response } = require("express");


exports.getHome = (request, response) => {
    response.render('main/home');
  };
  
exports.getClinicaV2 = (request, response) => {
response.render('main/clinica');
};

<<<<<<< HEAD
exports.getPaciente= (request, response, next) => {
    response.render('pacientes');
};

exports.getHistoriaClinica = (request, response, next) => {
    response.render('historiaClinica');
=======
exports.getPacientes = (request, response) => {
response.render('main/pacientes');
};

exports.getTrabajadores = (request, response) => {
response.render('main/trabajadores');
>>>>>>> c72a20ddf950413f0f1617edd7e12ee10378f5a3
};