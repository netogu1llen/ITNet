module.exports = (request, response, next) => {
    let canEliminarHistorialClinicoVer2 = false;

    for (let privilege of request.user.privileges) {
        if (privilege == 'Eliminar historial clínico ver2') {
            canEliminarHistorialClinicoVer2 = true;
            break;
        }
    }
 
    if (canEliminarHistorialClinicoVer2) {
        next();
    } else {
        return response.render('404');
    }
};
