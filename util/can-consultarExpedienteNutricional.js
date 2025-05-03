module.exports = (request, response, next) => {
    let canConsultarExpedienteNutricional = false;

    for (let privilege of request.user.privileges) {
        if (privilege === 'Consultar expediente nutricional') {
            canConsultarExpedienteNutricional = true;
            break;
        }
    }

    if (canConsultarExpedienteNutricional) {
        next();
    } else {
        return response.render('404');
    }
};
