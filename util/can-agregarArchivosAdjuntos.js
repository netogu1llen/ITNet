module.exports = (request, response, next) => {
    let canAgregarArchivosAdjuntos = false;

    for (let privilegio of request.session.privilegios) {
        if (privilegio.Privilegio === 'Agregar archivos adjuntos') {
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
