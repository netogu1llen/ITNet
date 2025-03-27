const { request, response } = require("express");


exports.getExpedienteNutricion= (request, response, next) => {
    response.render('expediente_nutricion');
};
