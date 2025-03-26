const { request, response } = require("express");



exports.getPacientes= (request, response, next) => {
    response.render('trabajadores');
};
