const { request, response } = require("express");


exports.getHome= (request, response, next) => {
    const datos = {
        labels: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio"],
        datasets: [
            { label: "Talla", data: [100, 102, 104, 106, 108, 110], borderColor: "#40E0D0", fill: false },
            { label: "Peso", data: [100, 98, 99, 101, 103, 104], borderColor: "#9370DB", fill: false },
            { label: "IMC", data: [100, 101, 102, 105, 104, 106], borderColor: "#FFA500", fill: false },
            { label: "Circunferencia cintura", data: [100, 98, 99, 101, 103, 105], borderColor: "#FF6666", fill: false },
            { label: "Circunferencia cadera", data: [100, 99, 100, 102, 104, 106], borderColor: "#1E90FF", fill: false },
            { label: "Índice cintura/cadera", data: [100, 101, 102, 104, 106, 108], borderColor: "#FFA07A", fill: false }
        ]
    };
    response.render('home', { datos });
};
