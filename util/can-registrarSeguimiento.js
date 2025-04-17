module.exports = (request, response, next) => {
    let canRegistrarSeguimiento = false;

    for (let privilegio of request.session.privilegios) {
        if (privilegio.Privilegio === 'Registrar seguimiento') {
            canRegistrarSeguimiento = true;
            break;
        }
    }

    if (canRegistrarSeguimiento) {
        next();
    } else {
        return response.render('404');
    }
};
