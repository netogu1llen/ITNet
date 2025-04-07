function enviarPost(url, data) {
    fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        Swal.fire({
            title: "Éxito!",
            text: data.mensaje || "Operación realizada con éxito",
            icon: "success"
        });
    })
    .catch(error => {
        console.error("Error:", error);
        Swal.fire({
            title: "Error!",
            text: `Hubo un problema al procesar la solicitud de ${data.accion}`,
            icon: "error"
        });
    });
}

// Botón Eliminar Registro con confirmación
document.getElementById('btn-eliminar').addEventListener('click', function() {
    Swal.fire({
        title: "Eliminar este registro?",
        text: "Ya no podrás ver esta información",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí, estoy seguro",
        cancelButtonText: "Cancelar"
    }).then((result) => {
        const idExpediente = document.getElementById('btn-eliminar').dataset.id;
        if (result.isConfirmed) {
            enviarPost(`/pacientes/eliminar/${idExpediente}`, { accion: "eliminar" });
        }
    });
});
document.getElementById('btn-editar').addEventListener('click', function() {
    const btnEditar = document.getElementById("btn-editar");
    if (btnEditar) {
        const id = btnEditar.dataset.id;
        btnEditar.addEventListener("click", () => {
        window.location.href = `/pacientes/editar/${id}`;
        });
    }
});
document.getElementById('btn-registrar').addEventListener('click', function() {
    const btnEditar = document.getElementById("btn-registrar");
    if (btnEditar) {
        btnEditar.addEventListener("click", () => {
        window.location.href = `/pacientes/registrar`;
        });
    }
});