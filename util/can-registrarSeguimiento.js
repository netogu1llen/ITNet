module.exports = (request, response, next) => {
    let canRegistrarSeguimiento = false;

    for (let privilege of request.user.privileges) {
        if (privilege == 'Registrar seguimiento') {
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
