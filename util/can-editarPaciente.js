module.exports = (request, response, next) => {
    let canEditarPaciente = false;

    for (let privilegio of request.session.privilegios) {
        if (privilegio.Privilegio === 'Editar Paciente') {
            canEditarPaciente = true;
            break;
        }
    }

    if (canEditarPaciente) {
        next();
    } else {
        return response.render('404');
    }
};
