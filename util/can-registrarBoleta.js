module.exports = (request, response, next) => {
    let canRegistrarBoleta = false;

    for (let privilegio of request.session.privilegios) {
        if (privilegio.Privilegio === 'Registrar boleta') {
            canRegistrarBoleta = true;
            break;
        }
    }

    if (canRegistrarBoleta) {
        next();
    } else {
        return response.render('404');
    }
};
