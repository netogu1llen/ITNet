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
            window.location.href = "/pacientes"});
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

            // Obtener los valores de los inputs
            const nombres = document.getElementById('nombres').value;
            const apellidoP = document.getElementById('apellidoP').value;
            const apellidoM = document.getElementById('apellidoM').value;
            const numExpediente = document.getElementById('numExpediente').value;
            const fechaNacimiento = document.getElementById('fechaNacimiento').value;
            const contacto = document.getElementById('contacto').value;
            const direccion = document.getElementById('direccion').value;
            const enfermedades = document.getElementById('enfermedades').value;
            const medicamentos = document.getElementById('medicamentos').value;
            const estudioSocioeconomico = document.getElementById('estudioSocioeconomico').value;
            const grado = document.getElementById('grado').value;
            const curso = document.getElementById('curso').value;
            const sangre = document.getElementById('sangre').value;

            // Arreglo de campos para validaciones
            const campos = [
                { id: 'nombres', nombre: 'Nombres' },
                { id: 'apellidoP', nombre: 'Apellido Paterno' },
                { id: 'apellidoM', nombre: 'Apellido Materno' },
                { id: 'numExpediente', nombre: 'Número de Expediente' },
                { id: 'fechaNacimiento', nombre: 'Fecha de Nacimiento' },
                { id: 'contacto', nombre: 'Contacto' },
                { id: 'direccion', nombre: 'Dirección' },
                { id: 'enfermedades', nombre: 'Enfermedades' },
                { id: 'medicamentos', nombre: 'Medicamentos' },
                { id: 'estudioSocioeconomico', nombre: 'Estudio Socioeconómico' },
                { id: 'grado', nombre: 'Grado' },
                { id: 'curso', nombre: 'Curso' },
                { id: 'sangre', nombre: 'Grupo Sanguíneo' }
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
                    text: `Remueve los caracteres no válidos de los siguientes campos: ${camposInvalidos.join(', ')}`,
                    icon: "error"
                });
                return;
            }

            // Crear objeto con los datos a enviar
            const datos = {
                nombres,
                apellidoP,
                apellidoM,
                numExpediente,
                fechaNacimiento,
                contacto,
                direccion,
                enfermedades,
                medicamentos,
                estudioSocioeconomico,
                grado,
                curso,
                sangre
            };

            // Llamar a la función para enviar los datos
            enviarPost(`/pacientes/registrar`, { accion: "registro", datos: datos });
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
                window.location.href = "/pacientes"});
        }
    });
});