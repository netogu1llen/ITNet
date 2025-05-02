module.exports = (request, response, next) => {
    let canEditarPaciente = false;

    for (let privilege of request.user.privileges) {
        if (privilege == 'Editar Paciente') {
            canEditarPaciente = true;
        }
    }

    if (canEditarPaciente) {
        next();
    } else {
        return response.render('404');
    }
};
