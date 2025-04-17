module.exports = (request, response, next) => {
    let canModificarUsuario = false;

    for (let privilegio of request.session.privilegios) {
        if (privilegio.Privilegio === 'Modificar usuario') {
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
