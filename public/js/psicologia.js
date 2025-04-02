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
};
 document.getElementById('btn-agregar-fila')?.addEventListener('click', function(e) {
    e.preventDefault();
    
    const tabla = document.getElementById('table');
    const nuevaFila = document.createElement('tr');
    
    nuevaFila.innerHTML = `
    <td>
        <div class="multirow-form-container">
            <textarea name="actividad" required rows="3" required></textarea>
        </div>
    </td>
    <td>
        <div class="multirow-form-container">
            <textarea name="tiempo" required rows="3" required></textarea>
        </div>
    </td>
    <td>
        <div class="multirow-form-container">
            <textarea name="metodologia" required rows="3" required></textarea>
        </div>
    </td>
    <td>
        <div class="multirow-form-container">
            <textarea name="objetivoActividad" required rows="3" required></textarea>
        </div>
    </td>
    <td>
        <div class="multirow-form-container">
            <textarea name="observaciones" required rows="3" required></textarea>
        </div>
    </td>
    <button class="button is-cancel" type="button">-</button>
    </td>
    `;
    tabla.appendChild(nuevaFila);
    
    // Evento para eliminar fila
    nuevaFila.querySelector('.is-cancel').addEventListener('click', function() {
      tabla.removeChild(nuevaFila);
    });
  });

// Botón Guardar Cambios con confirmación
document.getElementById('btn-guardar').addEventListener('click', function() {
    Swal.fire({
        title: "Guardar cambios?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí, estoy seguro",
        cancelButtonText: "Cancelar"
    }).then((result) => {
        if (result.isConfirmed) {
            enviarPost("/api/guardar", { accion: "guardar" });
        }
    });
});
// Botón Salir con opciones
document.getElementById('btn-cancelar').addEventListener('click', function() {
    Swal.fire({
        title: "Estas a punto de cancelar la operacion",
        text: "Estas seguro?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Si",
        cancelButtonText: "No"
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire("No se guardaron los cambios", "", "info").then(() => {
                window.location.href = "/psicologia/seguimientos"});
        }
    });
});
