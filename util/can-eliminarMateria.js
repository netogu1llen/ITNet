module.exports = (request, response, next) => {
    let canEliminarMateria = false;

    for (let privilegio of request.session.privilegios) {
        if (privilegio.Privilegio === 'Eliminar materia') {
            canEliminarMateria = true;
            break;
        }
    }

    if (canEliminarMateria) {
        next();
    } else {
        return response.render('404');
    }
};
