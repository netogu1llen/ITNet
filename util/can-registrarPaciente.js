module.exports = (request, response, next) => {
    let canRegistrarPaciente = false;

    for (let privilege of request.user.privileges) {
        if (privilege == 'Registrar Paciente') {
            canRegistrarPaciente = true;
            break;
        }
    }

    if (canRegistrarPaciente) {
        next();
    } else {
        return response.render('404');
    }
};
