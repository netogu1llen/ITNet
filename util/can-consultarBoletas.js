module.exports = (request, response, next) => {
    let canConsultarBoletas = false;

    for (let privilege of request.user.privileges) {
        if (privilege == 'Consultar boletas') {
            canConsultarBoletas = true;
            break;
        }
    }

    if (canConsultarBoletas) {
        next();
    } else {
        return response.render('404');
    }
};
