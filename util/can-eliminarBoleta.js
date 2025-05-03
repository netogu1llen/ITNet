module.exports = (request, response, next) => {
    let canEliminarBoleta = false;

    for (let privilege of request.user.privileges) {
        if (privilege == 'Eliminar boleta') {
            canEliminarBoleta = true;
            break;
        }
    }

    if (canEliminarBoleta) {
        next();
    } else {
        return response.render('404');
    }
};
