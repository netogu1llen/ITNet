const { request, response } = require("express");


exports.getSidebar= (request, response, next) => {
    response.render('sidebar');
};
