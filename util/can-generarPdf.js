module.exports = (request, response, next) => {
    let canGenerarPdf = false;

    for (let privilegio of request.session.privilegios) {
        if (privilegio.Privilegio === 'Generar PDF') {
            canGenerarPdf = true;
            break;
        }
    }

    if (canGenerarPdf) {
        next();
    } else {
        return response.render('404');
    }
};
