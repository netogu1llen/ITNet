module.exports = (request, response, next) => {
    let canEliminarBoleta = false;

    for (let privilegio of request.session.privilegios) {
        if (privilegio.Privilegio === 'Eliminar boleta') {
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
