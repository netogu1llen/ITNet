module.exports = (request, response, next) => {
    let canEditarHistorialClinicoVer2 = false;

    for (let privilege of request.user.privileges) {
        if (privilege == 'Editar historial clínico ver2') {
            canEditarHistorialClinicoVer2 = true;
            break;
        }
    }

    if (canEditarHistorialClinicoVer2) {
        next();
    } else {
        return response.render('404');
    }
};
