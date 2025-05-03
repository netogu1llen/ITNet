module.exports = (request, response, next) => {
    let canRegistrarHistorialClinicoVer1 = false;

    for (let privilege of request.user.privileges) {
        if (privilege == 'Registrar historial clínico ver1') {
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
