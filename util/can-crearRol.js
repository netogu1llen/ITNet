module.exports = (request, response, next) => {
    let canCrearRol = false;

    for (let privilege of request.user.privileges) {
        if (privilege == 'Crear rol') {
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
