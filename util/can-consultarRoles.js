module.exports = (request, response, next) => {
    let canConsultarRoles = false;

    for (let privilegio of request.session.privilegios) {
        if (privilegio.Privilegio === 'Consultar roles') {
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
