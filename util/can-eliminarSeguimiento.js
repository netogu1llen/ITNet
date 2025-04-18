module.exports = (request, response, next) => {
    let canEliminarSeguimiento = false;

    for (let privilegio of request.session.privilegios) {
        if (privilegio.Privilegio === 'Eliminar seguimiento') {
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
