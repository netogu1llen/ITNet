function inicializarBuscador({ 
    tablaID, 
    urlAPI, 
    columnas 
}) {
    $(document).ready(function () {
        const table = $(`#${tablaID}`).DataTable({
            ajax: {
                url: urlAPI,
                data: function (d) {
                    d.usuario = $('#filterUser').val();
                    d.fecha = $('#filterDate').val();
                    d.tipo = $('#filterType').val();
                }
            },
            columns: columnas
        });

        $('#filterBtn').on('click', function () {
            table.ajax.reload();
        });
    });
}
