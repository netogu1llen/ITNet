module.exports = (request, response, next) => {
    let canRegistrarMateria = false;

    for (let privilege of request.user.privileges) {
        if (privilege == 'Registrar materia') {
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
