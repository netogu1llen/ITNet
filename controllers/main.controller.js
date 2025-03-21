const { request, response } = require("express");


exports.getHeader= (request, response, next) => {
    response.render('header');
};
