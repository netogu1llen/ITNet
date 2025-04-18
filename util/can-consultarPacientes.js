module.exports = (request, response, next) => {
    let canConsultarPacientes = false;

    for (let privilegio of request.session.privilegios) {
        if (privilegio.Privilegio === 'Consultar pacientes') {
            canConsultarPacientes = true;
            break;
        }
    }

    if (canConsultarPacientes) {
        next();
    } else {
        return response.render('404');
    }
};
