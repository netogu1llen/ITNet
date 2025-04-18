module.exports = (request, response, next) => {
    let canEditarHistorialClinicoVer1 = false;

    for (let privilegio of request.session.privilegios) {
        if (privilegio.Privilegio === 'Editar historial clínico ver1') {
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
