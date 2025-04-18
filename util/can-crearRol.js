module.exports = (request, response, next) => {
    let canCrearRol = false;

    for (let privilegio of request.session.privilegios) {
        if (privilegio.Privilegio === 'Crear rol') {
            canCrearRol = true;
            break;
        }
    }

    if (canCrearRol) {
        next();
    } else {
        return response.render('404');
    }
};
