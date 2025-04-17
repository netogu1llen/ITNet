module.exports = (request, response, next) => {
    let canEditarMateria = false;

    for (let privilegio of request.session.privilegios) {
        if (privilegio.Privilegio === 'Editar materia') {
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
