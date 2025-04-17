module.exports = (request, response, next) => {
    let canEliminarRol = false;

    for (let privilegio of request.session.privilegios) {
        if (privilegio.Privilegio === 'Eliminar rol') {
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
