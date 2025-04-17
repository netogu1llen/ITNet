module.exports = (request, response, next) => {
    let canEliminarUsuario = false;

    for (let privilegio of request.session.privilegios) {
        if (privilegio.Privilegio === 'Eliminar usuario') {
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
