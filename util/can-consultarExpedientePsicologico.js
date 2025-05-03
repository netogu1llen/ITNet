module.exports = (request, response, next) => {
    let canConsultarExpedientePsicologico = false;

    for (let privilege of request.user.privileges) {
        if (privilege == 'Consultar expediente psicológico') {
            canConsultarExpedientePsicologico = true;
            break;
        }
    }

    if (canConsultarExpedientePsicologico) {
        next();
    } else {
        return response.render('404');
    }
};
