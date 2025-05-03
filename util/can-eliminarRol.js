module.exports = (request, response, next) => {
    let canEliminarRol = false;

    for (let privilege of request.user.privileges) {
        if (privilege == 'Eliminar rol') {
            canEliminarRol = true;
            break;
        }
    }

    if (canEliminarRol) {
        next();
    } else {
        return response.render('404');
    }
};
