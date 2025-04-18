module.exports = (request, response, next) => {
    let canConsultarExpedientePsicologico = false;

    for (let privilegio of request.session.privilegios) {
        if (privilegio.Privilegio === 'Consultar expediente psicológico') {
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
