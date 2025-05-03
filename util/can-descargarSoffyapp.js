module.exports = (request, response, next) => {
    let canDescargarSoffyapp = false;

    for (let privilege of request.user.privileges) {
        if (privilege == 'Descargar Soffyapp') {
            canDescargarSoffyapp = true;
            break;
        }
    }

    if (canDescargarSoffyapp) {
        next();
    } else {
        return response.render('404');
    }
};
