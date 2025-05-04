module.exports = (request, response, next) => {
    let canVerExpediente = false;

    for (let privilege of request.user.privileges) {
        if (privilege == 'Ver expediente') {
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
