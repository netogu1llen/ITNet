module.exports = (request, response, next) => {
    let canEliminarMateria = false;

    for (let privilege of request.user.privileges) {
        if (privilege == 'Eliminar materia') {
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
