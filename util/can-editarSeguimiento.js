module.exports = (request, response, next) => {
    let canEditarSeguimiento = false;

    for (let privilege of request.user.privileges) {
        if (privilege == 'Editar seguimiento') {
            canEditarSeguimiento = true;
            break;
        }
    }

    if (canEditarSeguimiento) {
        next();
    } else {
        return response.render('404');
    }
};
