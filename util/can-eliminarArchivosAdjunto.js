module.exports = (request, response, next) => {
    let canAgregarArchivosAdjuntos = false;

    for (let privilege of request.user.privileges) {
        if (privilege == 'Eliminar archivos adjuntos') {
            canAgregarArchivosAdjuntos = true;
            break;
        }
    }

    if (canAgregarArchivosAdjuntos) {
        next();
    } else {
        return response.render('404');
    }
};
