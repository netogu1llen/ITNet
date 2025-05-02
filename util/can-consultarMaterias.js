module.exports = (request, response, next) => {
    let canConsultarMaterias = false;

    for (let privilege of request.user.privileges) {
        if (privilege == 'Consultar materias') {
            canConsultarMaterias = true;
            break;
        }
    }

    if (canConsultarMaterias) {
        next();
    } else {
        return response.render('404');
    }
};
