module.exports = (request, response, next) => {
    let canEditarCalificacion = false;

    for (let privilege of request.user.privileges) {
        if (privilege == 'Editar calificación') {
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
