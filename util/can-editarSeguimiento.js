module.exports = (request, response, next) => {
    let canEditarSeguimiento = false;

    for (let privilegio of request.session.privilegios) {
        if (privilegio.Privilegio === 'Editar seguimiento') {
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
