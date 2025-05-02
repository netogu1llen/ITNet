module.exports = (request, response, next) => {
    let canGenerarPdf = false;

    for (let privilege of request.user.privileges) {
        if (privilege == 'Generar PDF') {
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
