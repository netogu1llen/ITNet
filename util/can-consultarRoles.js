module.exports = (request, response, next) => {
    let canConsultarRoles = false;

    for (let privilege of request.user.privileges) {
        if (privilege == 'Consultar roles') {
            canConsultarRoles = true;
            break;
        }
    }

    if (canConsultarRoles) {
        next();
    } else {
        return response.render('404');
    }
};
