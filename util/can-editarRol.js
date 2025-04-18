module.exports = (request, response, next) => {
    let canEditarRol = false;

    for (let privilegio of request.session.privilegios) {
        if (privilegio.Privilegio === 'Editar rol') {
            canEditarRol = true;
            break;
        }
    }

    if (canEditarRol) {
        next();
    } else {
        return response.render('404');
    }
};
