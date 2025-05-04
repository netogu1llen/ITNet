module.exports = (request, response, next) => {
    let canConsultarUsuarios = false;

    for (let privilege of request.user.privileges) {
        if (privilege == 'Consultar usuarios') {
            canConsultarUsuarios = true;
            break;
        }
    }

    if (canConsultarUsuarios) {
        next();
    } else {
        return response.render('404');
    }
};
