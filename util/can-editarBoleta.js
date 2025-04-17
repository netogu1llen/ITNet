module.exports = (request, response, next) => {
    let canEditarBoleta = false;

    for (let privilegio of request.session.privilegios) {
        if (privilegio.Privilegio === 'Editar boleta') {
            canEditarBoleta = true;
            break;
        }
    }

    if (canEditarBoleta) {
        next();
    } else {
        return response.render('404');
    }
};
