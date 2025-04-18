module.exports = (request, response, next) => {
    let canEliminarPaciente = false;

    for (let privilegio of request.session.privilegios) {
        if (privilegio.Privilegio === 'Eliminar Paciente') {
            canEliminarPaciente = true;
            break;
        }
    }

    if (canEliminarPaciente) {
        next();
    } else {
        return response.render('404');
    }
};
