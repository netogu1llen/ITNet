module.exports = (request, response, next) => {
    let canDescargarSoffyapp = false;

    for (let privilegio of request.session.privilegios) {
        if (privilegio.Privilegio === 'Descargar Soffyapp') {
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
