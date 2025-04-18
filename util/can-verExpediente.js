module.exports = (request, response, next) => {
    let canVerExpediente = false;

    for (let privilegio of request.session.privilegios) {
        if (privilegio.Privilegio === 'Ver expediente') {
            canEliminarHistorialClinicoVer1 = true;
            break;
        }
    }

    if (canVerExpediente) {
        next();
    } else {
        return response.render('404');
    }
};
