// FUNCIÓN GENERAL: Envía peticiones POST al servidor y maneja las respuestas
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
      // Obtener el ID correspondiente para redirección
      // Si es edición, response.idExpediente vendrá del servidor
      // Si es registro, el idExpediente viene de la URL
      const idExpediente = response.idExpediente || window.location.pathname.split('/').pop();
      window.location.href = `/psicologia/documentos/${idExpediente}`;
    });
})
.catch(error => {
    console.error("Error:", error);
    Swal.fire({
        title: "Error!",
        text: error || `Hubo un problema al procesar la solicitud de ${data.accion}`,
        icon: "error"
    });
});
};

// FUNCIONES DE MANEJO DE TABLA DINÁMICA
document.addEventListener('DOMContentLoaded', function() {
  configurarBotonesEliminarFila();
});

// Función y evento para eliminar las filas
function configurarBotonesEliminarFila() {
  const botonesEliminar = document.querySelectorAll('.is-cancel');
  
  botonesEliminar.forEach(boton => {boton.removeEventListener('click', eliminarFila); 
    boton.addEventListener('click', eliminarFila);
  });
}

function eliminarFila(event) {
  const fila = event.target.closest('tr');
  if (fila) {
    fila.remove();
  }
}

// Botón para agregar filas a la tabla
document.getElementById('btn-agregar-fila')?.addEventListener('click', function(e) {
  e.preventDefault();
  
  const tabla = document.getElementById('table');
  const nuevaFila = document.createElement('tr');
  
  // Obtener el índice de la nueva fila
  const index = tabla.rows.length;

  nuevaFila.innerHTML = `
      <td style="display:none;">
                <input type="hidden" name="objetivoId[]" value="">
            </td>
        <td>
        <div class="multirow-form-container">
            <textarea name="actividad[]" id="actividad[${index}]" required rows="3" id=""></textarea>
        </div>
    </td>
    <td>
        <div class="multirow-form-container">
            <textarea name="tiempo[]" id="tiempo[${index}]" required rows="3"></textarea>
        </div>
    </td>
    <td>
        <div class="multirow-form-container">
            <textarea name="metodologia[]" id="metodologia[${index}]" required rows="3"></textarea>
        </div>
    </td>
    <td>
        <div class="multirow-form-container">
            <textarea name="objetivo[]" id="objetivo[${index}]" required rows="3"></textarea>
        </div>
    </td>
    <td>
        <div class="multirow-form-container">
            <textarea name="observaciones[]" id="observaciones[${index}]" required rows="3"></textarea>
        </div>
    </td>
    <td>
        <button class="button is-cancel" type="button">-</button>
    </td>
  `;
  
  tabla.appendChild(nuevaFila);
  
  configurarBotonesEliminarFila();
});

// PARTE DE EDITAR SEGUIMIENTO
// Botón para guardar cambios en un seguimiento existente
const btnGuardar = document.getElementById('btn-guardar');
// Botón Guardar Cambios con confirmación
if (btnGuardar) {
  btnGuardar.addEventListener('click', function() {
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
          // Aquí estamos en modo edición, así que necesitamos el idSeguimiento
          const idSeguimiento = window.location.pathname.split('/').pop();
          
          // Obtener los valores de los campos principales
          const analisisPsicologico = document.getElementById('analisisPsicologico').value;
          const recomendaciones = document.getElementById('recomendaciones').value;
          const bitacora = document.getElementById('bitacora').value;
          const objetivoSesion = document.getElementById('objetivoSesion').value;
          const justificacionSesion = document.getElementById('justificacionSesion').value;
          const numSesion = document.getElementById('numSesion').value;
    
          // Obtener los valores de la tabla multi-fila (con las filas dinámicas)
          const actividad = Array.from(document.querySelectorAll('textarea[name^="actividad[]"]')).map(input => input.value.trim());
          const tiempo = Array.from(document.querySelectorAll('textarea[name^="tiempo[]"]')).map(input => input.value.trim());
          const metodologia = Array.from(document.querySelectorAll('textarea[name^="metodologia[]"]')).map(input => input.value.trim());
          const objetivo = Array.from(document.querySelectorAll('textarea[name^="objetivo[]"]')).map(input => input.value.trim());
          const observaciones = Array.from(document.querySelectorAll('textarea[name^="observaciones[]"]')).map(input => input.value.trim());
          //Se hace validaciones de campos
          const campos = [
            { id: 'analisisPsicologico', nombre: 'Análisis Psicológico' },
            { id: 'recomendaciones', nombre: 'Recomendaciones' },
            { id: 'bitacora', nombre: 'Bitácora' },
            { id: 'objetivoSesion', nombre: 'Objetivo de Sesión' },
            { id: 'justificacionSesion', nombre: 'Justificación de Sesión' },
            { id: 'numSesion', nombre: 'Numero de sesion' }
          ];
          
          let camposVacios = [];
          let camposInvalidos = [];
          const regexInvalido = /['"%;<>\\]/; // Caracteres potencialmente peligrosos
          
          // Validar los campos del formulario
          for (let campo of campos) {
            const valor = document.getElementById(campo.id).value.trim();
        
            if (!valor) {
              camposVacios.push(campo.nombre);
            } else if (regexInvalido.test(valor)) {
              camposInvalidos.push(campo.nombre);
            }
          }
          // Validar cada fila de la tabla multifila
          const nombreCamposTabla = ["Actividad", "Tiempo", "Metodología", "Objetivo", "Observaciones"];
          const arraysTabla = [actividad, tiempo, metodologia, objetivo, observaciones];
          for (let i = 0; i < actividad.length; i++) {
            for (let j = 0; j < arraysTabla.length; j++) {
              const valorCampo = arraysTabla[j][i];
              const nombreCampo = `${nombreCamposTabla[j]} (Fila ${i + 1})`;
    
              if (!valorCampo) {
                camposVacios.push(nombreCampo);
              } else if (regexInvalido.test(valorCampo)) {
                camposInvalidos.push(nombreCampo);
              }
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

        // Crear un objeto con los datos principales
        const datos = {
          numSesion,
          objetivoSesion,
          justificacionSesion,
          analisisPsicologico,
          recomendaciones,
          bitacora,
          actividad,  // Datos de la tabla
          tiempo,      // Datos de la tabla
          metodologia, // Datos de la tabla
          objetivo,    // Datos de la tabla
          observaciones // Datos de la tabla
        };
        console.log(datos);
        enviarPost(`/psicologia/seguimientos/editar/${idSeguimiento}`, { accion: "edición", datos: datos });
      }
    });
  });
}

// FUNCIÓN COMPARTIDA: Botón para cancelar la operación (aplica tanto para edición como para registro)
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
          // Determinar si estamos en editar o registrar para obtener el idExpediente correcto
          const url = window.location.pathname;
          let idExpediente;
          
          if (url.includes('/editar/')) {
            // Si estamos editando, necesitamos obtener el idExpediente desde el servidor
            // Como no tenemos acceso directo, redirigimos hacia atrás en la historia del navegador
            window.history.back();
            return;
          } else {
            // Si estamos registrando, el idExpediente está en la URL
            idExpediente = url.split('/').pop();
            window.location.href = `/psicologia/documentos/${idExpediente}`;
          }
      });
      }
  });
});

// PARTE DE REGISTRAR SEGUIMIENTO
// Botón para registrar un nuevo seguimiento
const btnRegistrar = document.getElementById('btn-registrar');
if (btnRegistrar) {
  btnRegistrar.addEventListener('click', function() {
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
      // Aquí estamos en modo registro, así que necesitamos el idExpediente
      const idExpediente = window.location.pathname.split('/').pop();

      // Obtener los valores de los campos principales
      const analisisPsicologico = document.getElementById('analisisPsicologico').value;
      const recomendaciones = document.getElementById('recomendaciones').value;
      const bitacora = document.getElementById('bitacora').value;
      const objetivoSesion = document.getElementById('objetivoSesion').value;
      const justificacionSesion = document.getElementById('justificacionSesion').value;
      const numSesion = document.getElementById('numSesion').value;

      // Obtener los valores de la tabla multi-fila (con las filas dinámicas)
      const actividad = Array.from(document.querySelectorAll('textarea[name="actividad[]"]')).map(input => input.value.trim());
      const tiempo = Array.from(document.querySelectorAll('textarea[name="tiempo[]"]')).map(input => input.value.trim());
      const metodologia = Array.from(document.querySelectorAll('textarea[name="metodologia[]"]')).map(input => input.value.trim());
      const objetivo = Array.from(document.querySelectorAll('textarea[name="objetivo[]"]')).map(input => input.value.trim());
      const observaciones = Array.from(document.querySelectorAll('textarea[name="observaciones[]"]')).map(input => input.value.trim());

      console.log(actividad, tiempo, metodologia, objetivo, observaciones);
      const campos = [
        { id: 'analisisPsicologico', nombre: 'Análisis Psicológico' },
        { id: 'recomendaciones', nombre: 'Recomendaciones' },
        { id: 'bitacora', nombre: 'Bitácora' },
        { id: 'objetivoSesion', nombre: 'Objetivo de Sesión' },
        { id: 'justificacionSesion', nombre: 'Justificación de Sesión' },
        { id: 'numSesion', nombre: 'Numero de sesión' }
      ];
      
      let camposVacios = [];
      let camposInvalidos = [];
      const regexInvalido = /['"%;<>\\]/; // Caracteres potencialmente peligrosos
      
      // Validar los campos del formulario
      for (let campo of campos) {
        const valor = document.getElementById(campo.id).value.trim();
    
        if (!valor) {
          camposVacios.push(campo.nombre);
        } else if (regexInvalido.test(valor)) {
          camposInvalidos.push(campo.nombre);
        }
      }
      // Validar cada fila de la tabla multifila
      const nombreCamposTabla = ["Actividad", "Tiempo", "Metodología", "Objetivo", "Observaciones"];
      const arraysTabla = [actividad, tiempo, metodologia, objetivo, observaciones];
      for (let i = 0; i < actividad.length; i++) {
        for (let j = 0; j < arraysTabla.length; j++) {
          const valorCampo = arraysTabla[j][i];
          const nombreCampo = `${nombreCamposTabla[j]} (Fila ${i + 1})`;

          if (!valorCampo) {
            camposVacios.push(nombreCampo);
          } else if (regexInvalido.test(valorCampo)) {
            camposInvalidos.push(nombreCampo);
          }
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
      // Crear un objeto con los datos principales
      const datos = {
        numSesion,
        objetivoSesion,
        justificacionSesion,
        analisisPsicologico,
        recomendaciones,
        bitacora,
        actividad,  // Datos de la tabla
        tiempo,      // Datos de la tabla
        metodologia, // Datos de la tabla
        objetivo,    // Datos de la tabla
        observaciones // Datos de la tabla
      };
      enviarPost(`/psicologia/seguimientos/registrar/${idExpediente}`, { accion: "registro", datos: datos });
    }
  });
});
}