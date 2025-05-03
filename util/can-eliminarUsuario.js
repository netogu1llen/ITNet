module.exports = (request, response, next) => {
    let canEliminarUsuario = false;

    for (let privilege of request.user.privileges) {
        if (privilege == 'Eliminar usuario') {
            canEliminarUsuario = true;
            break;
        }
    }

    if (canEliminarUsuario) {
        next();
    } else {
        return response.render('404');
    }
};
