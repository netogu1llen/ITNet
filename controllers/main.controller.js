const { request, response } = require("express");


exports.getHome= (request, response, next) => {
    response.render('home');
};
