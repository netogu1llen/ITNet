module.exports = (request, response, next) => {
    let canConsultarMaterias = false;

    for (let privilegio of request.session.privilegios) {
        if (privilegio.Privilegio === 'Consultar materias') {
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
