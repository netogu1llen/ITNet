module.exports = (request, response, next) => {
    let canRegistrarUsuario = false;

    for (let privilegio of request.session.privilegios) {
        if (privilegio.Privilegio === 'Registrar usuario') {
            canRegistrarUsuario = true;
            break;
        }
    }

    if (canRegistrarUsuario) {
        next();
    } else {
        return response.render('404');
    }
};
