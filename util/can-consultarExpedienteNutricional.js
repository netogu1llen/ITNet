module.exports = (request, response, next) => {
    let canConsultarExpedienteNutricional = false;

    for (let privilegio of request.session.privilegios) {
        if (privilegio.Privilegio === 'Consultar expediente nutricional') {
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
