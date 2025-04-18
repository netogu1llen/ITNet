module.exports = (request, response, next) => {
    let canRegistrarHistorialClinicoVer1 = false;

    for (let privilegio of request.session.privilegios) {
        if (privilegio.Privilegio === 'Registrar historial clínico ver1') {
            canRegistrarHistorialClinicoVer1 = true;
            break;
        }
    }

    if (canRegistrarHistorialClinicoVer1) {
        next();
    } else {
        return response.render('404');
    }
};
