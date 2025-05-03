module.exports = (request, response, next) => {
    let canEditarRol = false;

    for (let privilege of request.user.privileges) {
        if (privilege == 'Editar rol') {
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
