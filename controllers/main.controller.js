const { request, response } = require("express");


exports.getHome= (request, response, next) => {
    response.render('home');
};

exports.getEncuestaNino= (request, response, next) => {
    response.render('encuestaNinos');
};