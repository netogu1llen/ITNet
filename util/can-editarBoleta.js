module.exports = (request, response, next) => {
    let canEditarBoleta = false;

    for (let privilege of request.user.privileges) {
        if (privilege == 'Editar boleta') {
            canEditarBoleta = true;
            break;
        }
    }

    if (canEditarBoleta) {
        next();
    } else {
        return response.render('404');
    }
};
