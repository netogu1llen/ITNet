module.exports = (request, response, next) => {
    let canRegistrarUsuario = false;

    for (let privilege of request.user.privileges) {
        if (privilege == 'Registrar usuario') {
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
