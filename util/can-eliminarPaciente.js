module.exports = (request, response, next) => {
    let canEliminarPaciente = false;

    for (let privilege of request.user.privileges) {
        if (privilege == 'Eliminar Paciente') {
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
