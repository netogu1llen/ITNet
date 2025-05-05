module.exports = (request, response, next) => {
    let canSidebar = false;

    for (let privilege of request.user.privileges) {
        if (privilege == 'Consultar paciente') {
            canSidebar = true;
            break;
        }
    }

    if (canSidebar) {
        next();
    } else {
        return response.render('404');
    }
};
