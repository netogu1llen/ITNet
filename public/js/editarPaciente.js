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
            const idExpediente = window.location.pathname.split('/').pop();
            window.location.href = `/pacientes/expediente/${idExpediente}`;
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
            const estado = document.getElementById('estado').value;
            const ciudad = document.getElementById('ciudad').value;
            const calle = document.getElementById('calle').value;
            const cp = document.getElementById('cp').value;
            const localidad = document.getElementById('localidad').value;
            const numCasa = document.getElementById('numCasa').value;
            const enfermedades = document.getElementById('enfermedades').value;
            const medicamentos = document.getElementById('medicamentos').value;
            const estudioSocioeconomico = document.getElementById('estudioSocioeconomico').value;
            const grado = document.getElementById('grado').value;
            const nvEscolar = document.getElementById('nvEscolar').value;
            const sangre = document.getElementById('sangre').value;

            // Arreglo de campos para validaciones
            const campos = [
                { id: 'nombres', nombre: 'nombres' },
                { id: 'apellidoP', nombre: 'apellidoP' },
                { id: 'apellidoM', nombre: 'apellidoM' },
                { id: 'numExpediente', nombre: 'numExpediente' },
                { id: 'fechaNacimiento', nombre: 'fechaNacimiento' },
                { id: 'estado', nombre: 'estado' },
                { id: 'ciudad', nombre: 'ciudad' },
                { id: 'calle', nombre: 'calle' },
                { id: 'cp', nombre: 'cp' },
                { id: 'localidad', nombre: 'localiadd' },
                { id: 'numCasa', nombre: 'numcasa' },
                { id: 'enfermedades', nombre: 'enfermedades' },
                { id: 'medicamentos', nombre: 'medicamentos' },
                { id: 'estudioSocioeconomico', nombre: 'estudioSocioeconomico' },
                { id: 'grado', nombre: 'grado' },
                { id: 'nvEscolar', nombre: 'nvEscolar' },
                { id: 'sangre', nombre: 'sangre' }
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

            // Validar que contacto tenga solo 10 números
            const contactoRegex = /^[0-9]{10}$/;
            if (!contactoRegex.test(contacto)) {
            Swal.fire({
            title: "Contacto inválido",
            text: "El número de contacto debe tener exactamente 10 dígitos numéricos.",
            icon: "error"
            });
            return;
            }
            // Validar que codigo postal tenga solo 5 números
            const cpRegex = /^[0-9]{5}$/;
            if (!cpRegex.test(cp)) {
            Swal.fire({
            title: "Contacto inválido",
            text: "El número de codigo postal debe tener exactamente 5 dígitos numéricos.",
            icon: "error"
            });
            return;
            }

            // Validar que fecha de nacimiento no sea mayor a hoy
            const fechaHoy = new Date().toISOString().split("T")[0];
            if (fechaNacimiento > fechaHoy) {
            Swal.fire({
            title: "Fecha inválida",
            text: "La fecha de nacimiento no puede ser posterior a hoy.",
            icon: "error"
            });
            return;
            }
            // Crear objeto con los datos a enviar
            const datos = {
                nombres,
                apellidoP,
                apellidoM,
                fechaNacimiento,
                contacto,
                estado,
                ciudad,
                calle,
                cp,
                localidad,
                numCasa,
                numExpediente,
                enfermedades,
                medicamentos,
                estudioSocioeconomico,
                grado,
                nvEscolar,
                sangre
            };

            // Llamar a la función para enviar los datos
            enviarPost(`/pacientes/editar/${idExpediente}`, { accion: "edicion", datos: datos });
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
                const idExpediente = window.location.pathname.split('/').pop();
                window.location.href = `/pacientes/expediente/${idExpediente}`;
            });
        }
    });
});

const nvEscolarSelect = document.getElementById("nvEscolar");
const gradoSelect = document.getElementById("grado");

const todosLosGrados = [
"1°", "2°", "3°", "4°", "5°", "6°"
];

function actualizarGrados() {
const nivel = nvEscolarSelect.value;

// Guardar valor previamente seleccionado, si existe
const valorSeleccionado = gradoSelect.value;

// Determinar hasta qué grado mostrar
const maxGrado = (nivel === "Preescolar" || nivel === "Secundaria" || nivel === "Preparatoria") ? 3 : 6;

// Limpiar opciones anteriores
gradoSelect.innerHTML = '<option value="">Seleccione un grado</option>';

// Agregar opciones según el nivel
for (let i = 1; i <= maxGrado; i++) {
    const grado = `${i}°`;
    const option = document.createElement("option");
    option.value = grado;
    option.textContent = grado;
    
    // Restaurar selección previa si aún es válida
    if (valorSeleccionado === grado) {
    option.selected = true;
    }

    gradoSelect.appendChild(option);
}
}


document.getElementById("contacto").addEventListener("input", function () {
    this.value = this.value.replace(/[^0-9]/g, '');
  });
document.getElementById("cp").addEventListener("input", function () {
this.value = this.value.replace(/[^0-9]/g, '');
});
document.getElementById("numCasa").addEventListener("input", function () {
    this.value = this.value.replace(/[^0-9]/g, '');
    });
    
// Escuchar cambios
nvEscolarSelect.addEventListener("change", actualizarGrados);

// Ejecutar una vez al cargar por si ya hay un valor seleccionado
window.addEventListener("DOMContentLoaded", () => {
    const hoy = new Date();
    const yyyy = hoy.getFullYear();
    const mm = String(hoy.getMonth() + 1).padStart(2, '0');
    const dd = String(hoy.getDate()).padStart(2, '0');
    const fechaLocal = `${yyyy}-${mm}-${dd}`;
    document.getElementById("fechaNacimiento").max = fechaLocal;

    // Actualizar opciones de grado según nivel escolar
    actualizarGrados();
  });