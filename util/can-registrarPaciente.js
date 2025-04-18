module.exports = (request, response, next) => {
    let canRegistrarPaciente = false;

    for (let privilegio of request.session.privilegios) {
        if (privilegio.Privilegio === 'Registrar Paciente') {
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
