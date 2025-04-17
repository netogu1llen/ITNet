module.exports = (request, response, next) => {
    let canSidebar = false;

    for (let privilegio of request.session.privilegios) {
        if (privilegio.Privilegio === 'Sidebar') {
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
