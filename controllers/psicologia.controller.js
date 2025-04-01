const { request, response } = require("express");


exports.get_registrar_seguimiento= (request, response, next) => {
    response.render('registrarSeguimiento');
};