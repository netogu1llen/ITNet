module.exports = (request, response, next) => {
    let canEliminarSeguimiento = false;

    for (let privilege of request.user.privileges) {
        if (privilege == 'Eliminar seguimiento') {
            canEliminarSeguimiento = true;
            break;
        }
    }

    if (canEliminarSeguimiento) {
        next();
    } else {
        return response.render('404');
    }
};
