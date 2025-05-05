module.exports = (request, response, next) => {
    let canModificarUsuario = false;

    for (let privilege of request.user.privileges) {
        if (privilege == 'Modificar usuario') {
            canModificarUsuario = true;
            break;
        }
    }

    if (canModificarUsuario) {
        next();
    } else {
        return response.render('404');
    }
};
