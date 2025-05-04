module.exports = (request, response, next) => {
    let canDescargarPdf = false;

    for (let privilege of request.user.privileges) {
        if (privilege == 'Descargar PDF') {
            canDescargarPdf = true;
            break;
        }
    }

    if (canDescargarPdf) {
        next();
    } else {
        return response.render('404');
    }
};
