module.exports = (request, response, next) => {
    let canRegistrarMateria = false;

    for (let privilegio of request.session.privilegios) {
        if (privilegio.Privilegio === 'Registrar materia') {
            canRegistrarMateria = true;
            break;
        }
    }

    if (canRegistrarMateria) {
        next();
    } else {
        return response.render('404');
    }
};
