module.exports = (request, response, next) => {
    let canConsultarPacientes = false;

    for (let privilege of request.user.privileges) {
        if (privilege == 'Consultar pacientes') {
            canConsultarPacientes = true;
        }
    }

    if (canConsultarPacientes) {
        next();
    } else {
        return response.status(403).json({ 
            mensaje: 'Acceso denegado: no tienes permisos suficientes.' 
        });
    }
}
