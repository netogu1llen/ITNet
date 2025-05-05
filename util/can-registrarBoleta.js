module.exports = (request, response, next) => {
    let canRegistrarBoleta = false;

    for (let privilege of request.user.privileges) {
        if (privilege == 'Registrar boleta') {
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
