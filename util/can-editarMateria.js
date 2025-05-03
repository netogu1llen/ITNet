module.exports = (request, response, next) => {
    let canEditarMateria = false;

    for (let privilege of request.user.privileges) {
        if (privilege == 'Editar materia') {
            canEditarMateria = true;
            break;
        }
    }

    if (canEditarMateria) {
        next();
    } else {
        return response.render('404');
    }
};
