module.exports = (request, response, next) => {
    let canEliminarHistorialClinicoVer1 = false;

    for (let privilegio of request.session.privilegios) {
        if (privilegio.Privilegio === 'Eliminar historial clínico ver1') {
            canEliminarHistorialClinicoVer1 = true;
            break;
        }
    }

    if (canEliminarHistorialClinicoVer1) {
        next();
    } else {
        return response.render('404');
    }
};
