function enviarPost(url, data) {
    // Mostrar la alerta de "procesando solicitud"
    Swal.fire({
        title: 'Procesando solicitud...',
        text: 'Por favor espere.',
        icon: 'info',
        showConfirmButton: false, // No mostrar botón de confirmación
        allowOutsideClick: false, // No permitir que se cierre fuera del cuadro
        willOpen: () => {
            Swal.showLoading(); // Mostrar el spinner de carga
        }
    });
    fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data.datos)
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(error => { throw new Error(error.mensaje || 'Error desconocido') });
        }
        return response.json();
    })
    .then(response => {
        Swal.fire({
            title: "Éxito!",
            text: response.mensaje || "Operación realizada con éxito",
            icon: "success"
        }).then(() => {
            window.location.href = "/psicologia/"});
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
            const idExpediente = window.location.pathname.split('/').pop();

            const analisisPsicologico = document.getElementById('analisisPsicologico').value;
            const recomendaciones = document.getElementById('recomendaciones').value;
            const bitacora = document.getElementById('bitacora').value;
            const objetivoSesion = document.getElementById('objetivoSesion').value;
            const justificacionSesion = document.getElementById('justificacionSesion').value;


            const campos = [
                { id: 'analisisPsicologico', nombre: 'Análisis Psicológico' },
                { id: 'recomendaciones', nombre: 'Recomendaciones' },
                { id: 'bitacora', nombre: 'Bitácora' },
                { id: 'objetivoSesion', nombre: 'Objetivo de Sesión' },
                { id: 'justificacionSesion', nombre: 'Justificación de Sesión' }
            ];
            
            let camposVacios = [];
            let camposInvalidos = [];
            const regexInvalido = /['"%;<>\\]/; // Caracteres potencialmente peligrosos
            
            for (let campo of campos) {
                const valor = document.getElementById(campo.id).value.trim();
            
                if (!valor) {
                    camposVacios.push(campo.nombre);
                } else if (regexInvalido.test(valor)) {
                    camposInvalidos.push(campo.nombre);
                }
            }
            
            if (camposVacios.length > 0) {
                Swal.fire({
                    title: "Campos vacíos",
                    text: `Por favor completa los siguientes campos: ${camposVacios.join(', ')}`,
                    icon: "error"
                });
                return;
            }
            
            if (camposInvalidos.length > 0) {
                Swal.fire({
                    title: "Caracteres no permitidos",
                    text: `Remueve los caracteres no validos de los siguientes campos: ${camposInvalidos.join(', ')}`,
                    icon: "error"
                });
                return;
            }

            
            const datos = {
                objetivoSesion,
                justificacionSesion,
                analisisPsicologico,
                recomendaciones,
                bitacora
            };
            enviarPost(`/psicologia/seguimientos/registrar/${idExpediente}`, { accion: "registro", datos: datos});
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
