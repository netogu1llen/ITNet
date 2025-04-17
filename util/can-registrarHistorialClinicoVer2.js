module.exports = (request, response, next) => {
    let canRegistrarHistorialClinicoVer2 = false;

    for (let privilegio of request.session.privilegios) {
        if (privilegio.Privilegio === 'Registrar historial clínico ver2') {
            canRegistrarHistorialClinicoVer2 = true;
            break;
        }
    }

    if (canRegistrarHistorialClinicoVer2) {
        next();
    } else {
        return response.render('404');
    }
};
