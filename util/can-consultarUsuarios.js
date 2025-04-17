module.exports = (request, response, next) => {
    let canConsultarUsuarios = false;

    for (let privilegio of request.session.privilegios) {
        if (privilegio.Privilegio === 'Consultar usuarios') {
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
