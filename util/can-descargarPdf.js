module.exports = (request, response, next) => {
    let canDescargarPdf = false;

    for (let privilegio of request.session.privilegios) {
        if (privilegio.Privilegio === 'Descargar PDF') {
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
