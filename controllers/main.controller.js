const { request, response } = require("express");


exports.getHome= (request, response, next) => {
    response.render('home');
};

exports.getPaciente= (request, response, next) => {
    response.render('pacientes');
};

exports.getHistoriaClinica = (request, response, next) => {
    response.render('historiaClinica');
};