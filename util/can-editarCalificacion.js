module.exports = (request, response, next) => {
    let canEditarCalificacion = false;

    for (let privilegio of request.session.privilegios) {
        if (privilegio.Privilegio === 'Editar calificación') {
            canEditarCalificacion = true;
            break;
        }
    }

    if (canEditarCalificacion) {
        next();
    } else {
        return response.render('404');
    }
};
