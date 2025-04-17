module.exports = (request, response, next) => {
    let canDescargarPdfNeto = false;

    for (let privilegio of request.session.privilegios) {
        if (privilegio.Privilegio === 'Descargar PDF Neto') {
            canDescargarPdfNeto = true;
            break;
        }
    }

    if (canDescargarPdfNeto) {
        next();
    } else {
        return response.render('404');
    }
};
