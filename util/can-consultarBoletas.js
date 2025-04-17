module.exports = (request, response, next) => {
    let canConsultarBoletas = false;

    for (let privilegio of request.session.privilegios) {
        if (privilegio.Privilegio === 'Consultar boletas') {
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
