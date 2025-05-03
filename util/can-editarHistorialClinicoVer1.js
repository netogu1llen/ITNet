module.exports = (request, response, next) => {
    let canEditarHistorialClinicoVer1 = false;

    for (let privilege of request.user.privileges) {
        if (privilege == 'Editar historial clínico ver1') {
            canEditarHistorialClinicoVer1 = true;
            break;
        }
    }

    if (canEditarHistorialClinicoVer1) {
        next();
    } else {
        return response.render('404');
    }
};
