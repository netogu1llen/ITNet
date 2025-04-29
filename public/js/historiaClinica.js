document.addEventListener('DOMContentLoaded', function() {
  const tabla = document.getElementById('tabla-indicadores');
  const botonAgregar = document.getElementById('btn-agregar-fila');

  // Función para agregar nueva fila
  botonAgregar.addEventListener('click', function(e) {
    e.preventDefault();

    const nuevaFila = document.createElement('tr');
    nuevaFila.innerHTML = `
      <td><input class="input" type="text" name="parametroBioquimico[]" placeholder="Parámetro..." required></td>
      <td><input class="input" type="text" name="valorReferencia[]" placeholder="Valor de referencia..." required></td>
      <td><input class="input" type="date" name="fechaParametro[]" required></td>
      <td><button type="button" class="button is-danger btn-eliminar-fila">-</button></td>
    `;

    tabla.appendChild(nuevaFila);

    configurarBotonesEliminarFila(); // Vuelve a configurar los botones de eliminar
  });

  // Función para configurar botones de eliminar
  function configurarBotonesEliminarFila() {
    const botonesEliminar = tabla.querySelectorAll('.btn-eliminar-fila');
    botonesEliminar.forEach(boton => {
      boton.onclick = function() {
        this.closest('tr').remove();
      };
    });
  }

  // Configurar inicialmente (por las 4 filas que ya existen)
  configurarBotonesEliminarFila();
});

document.addEventListener('DOMContentLoaded', function() {
  const tablaObjetivos = document.getElementById('tabla-objetivos');
  const botonAgregarObjetivo = document.getElementById('btn-agregar-fila-objetivos');

  // Función para agregar una nueva fila
  botonAgregarObjetivo.addEventListener('click', function(e) {
    e.preventDefault();

    const nuevaFila = document.createElement('tr');
    nuevaFila.innerHTML = `
      <td>
        <input name="objetivosNutricionales[]" class="input" type="text" placeholder="Objetivo..." required>
      </td>
      <td>
        <button type="button" class="button is-danger btn-eliminar-fila">-</button>
      </td>
    `;

    tablaObjetivos.appendChild(nuevaFila);

    configurarBotonesEliminarFila();
  });

  // Función para configurar los botones de eliminar
  function configurarBotonesEliminarFila() {
    const botonesEliminar = tablaObjetivos.querySelectorAll('.btn-eliminar-fila');
    botonesEliminar.forEach(boton => {
      boton.onclick = function() {
        this.closest('tr').remove();
      };
    });
  }

  // Configurar inicialmente para las filas generadas en EJS
  configurarBotonesEliminarFila();
});

// Función de validación del formulario
function validarFormulario() {
    let errores = [];
    const camposRequeridos = document.querySelectorAll('[required]');
    
    camposRequeridos.forEach(campo => {
        if (!campo.value.trim()) {
            errores.push(`El campo ${campo.id || 'requerido'} está vacío`);
            campo.classList.add('is-danger');
        } else {
            campo.classList.remove('is-danger');
        }
    });

    // Validaciones específicas para campos numéricos
    const peso = document.getElementById('peso');
    const talla = document.getElementById('talla');

    if (peso && (isNaN(peso.value) || parseFloat(peso.value) <= 0)) {
        errores.push('El peso debe ser un número mayor a 0');
        peso.classList.add('is-danger');
    }
    if (talla && (isNaN(talla.value) || parseFloat(talla.value) <= 0)) {
        errores.push('La talla debe ser un número mayor a 0');
        talla.classList.add('is-danger');
    }

    return errores;
}

// Modificar el event listener del botón guardar
document.addEventListener('DOMContentLoaded', function () {
    const modoEdicion = document.getElementById('idExpediente').dataset.modoEdicion === 'true';
    const botonesGuardar = document.querySelectorAll('.btn-guardar');

    if (botonesGuardar.length > 0) {
        botonesGuardar.forEach(boton => {
            boton.textContent = modoEdicion ? 'Actualizar' : 'Guardar';
            
            boton.addEventListener('click', async function (e) {
                e.preventDefault();

                const errores = validarFormulario();
                if (errores.length > 0) {
                    Swal.fire({
                        title: 'Error',
                        html: errores.join('<br>'),
                        icon: 'error'
                    });
                    return;
                }

                const datos = recopilarDatosFormulario();
                if (!datos) return; // Si recopilarDatosFormulario retorna null, detener el proceso

                const url = modoEdicion ? 
                    '/nutricion/historiaClinica/actualizarHistoriaClinicaV1' : 
                    '/nutricion/historiaClinica/guardarHistoriaClinicaV1';

                try {
                    const respuesta = await fetch(url, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(datos)
                    });

                    const resultado = await respuesta.json();

                    if (resultado.success) {
                        Swal.fire({
                            title: "¡Éxito!",
                            text: modoEdicion ? "Historia clínica actualizada correctamente." : "Historia clínica guardada correctamente.",
                            icon: "success"
                        }).then(() => {
                            window.location.href = `/nutricion/documentos/${datos.IDExpediente}`;
                        });
                    } else {
                        throw new Error(resultado.message || 'Error al procesar la solicitud');
                    }
                } catch (error) {
                    console.error('Error:', error);
                    Swal.fire({
                        title: "Error",
                        text: error.message || "Error al procesar la solicitud",
                        icon: "error"
                    });
                }
            });
        });
    }
});

function recopilarDatosFormulario() {
    const idExpediente = document.getElementById('idExpediente')?.value;

    if (!idExpediente) {
        Swal.fire({
            title: "Error!",
            text: "No se encontró IDExpediente.",
            icon: "error"
        });
        return;
    }

    // Validar que todos los campos requeridos estén llenos
    const inputsRequeridos = document.querySelectorAll('input[required], textarea[required]');
    for (const input of inputsRequeridos) {
        if (!input.value.trim()) {
            Swal.fire({
                title: "Campos incompletos",
                text: "Por favor, rellena todos los campos obligatorios antes de guardar.",
                icon: "warning"
            });
            input.focus();
            return;
        }
    }
    
    const fechaInicio = document.getElementById('fechaInicio')?.value || '';

    // Para indicadores bioquímicos:
    const parametro = Array.from(document.querySelectorAll('input[name="parametroBioquimico[]"]')).map(input => input.value.trim());
    const valorReferencia = Array.from(document.querySelectorAll('input[name="valorReferencia[]"]')).map(input => input.value.trim());
    const parametroFecha = Array.from(document.querySelectorAll('input[name="fechaParametro[]"]')).map(input => input.value.trim());

    // Para objetivos nutricionales:
    const objetivo = Array.from(document.querySelectorAll('input[name="objetivosNutricionales[]"]')).map(input => input.value.trim());

    return {
        IDExpediente: document.getElementById('idExpediente')?.value || null,

        // Página 1
        numSesion: document.getElementById('numSesion')?.value || '',
        diabetes: document.getElementById('diabetes')?.value || '',
        cancer: document.getElementById('cancer')?.value || '',
        dislipidemia: document.getElementById('dislipidemia')?.value || '',
        obesidad: document.getElementById('obesidad')?.value || '',
        anemia: document.getElementById('anemia')?.value || '',
        hipertensionArterial: document.getElementById('hipertensionArterial')?.value || '',
        pesoNacer:document.getElementById('pesoNacer')?.value || '',
        tallaNacer: document.getElementById('tallaNacer')?.value || '',
        tipoAlimentacion: document.getElementById('tipoAlimentacion')?.value || '',
        alimentacionRecibida: document.getElementById('alimentacionRecibida')?.value || '',
        sdg: document.getElementById('sdg')?.value || '',
        tipoParto: document.getElementById('tipoParto')?.value || '',
        complicaciones: document.getElementById('complicaciones')?.value || '',
        lactancia: document.getElementById('lactancia')?.value || '',
        tiempo: document.getElementById('tiempo')?.value || '',
        edadAlimentacionComplementaria: document.getElementById('edadAlimentacionComplementaria')?.value || '',
        alimentosPrimerAnio: document.getElementById('alimentosPrimerAnio')?.value || '',

        // Página 2
        cabello: document.getElementById('cabello')?.value || '',
        conjunto: document.getElementById('conjunto')?.value || '',
        unias: document.getElementById('unias')?.value || '',
        boca: document.getElementById('boca')?.value || '',
        dientes: document.getElementById('dientes')?.value || '',
        piel: document.getElementById('piel')?.value || '',
        edema: document.getElementById('edema')?.value || '',
        
        vomito: document.getElementById('vomito')?.value || '',
        reflujo: document.getElementById('reflujo')?.value || '',
        disfagia: document.getElementById('disfagia')?.value || '',
        diarrea: document.getElementById('diarrea')?.value || '',
        flatulencias: document.getElementById('flatulencias')?.value || '',
        estrenimiento: document.getElementById('estrenimiento')?.value || '',
        distencion: document.getElementById('distencion')?.value || '',
        colitis: document.getElementById('colitis')?.value || '',
        pirosis: document.getElementById('pirosis')?.value || '',
        gastritis: document.getElementById('gastritis')?.value || '',
        otro: document.getElementById('otro')?.value || '',

        ejercicioFisico: document.getElementById('ejercicioFisico')?.value || '',
        fechaInicio,
        frecuencia: document.getElementById('frecuencia')?.value || '',

        // Página 3
        parametro, // indicadores bioquímicos
        valorReferencia,
        parametroFecha,

        talla: document.getElementById('talla')?.value || '',
        peso: document.getElementById('peso')?.value || '',
        circunferenciaCintura: document.getElementById('circunferenciaCintura')?.value || '',
        circunferenciaCadera: document.getElementById('circunferenciaCadera')?.value || '',

        diagnosticoEvolucion: document.getElementById('diagnosticoEvolucion')?.value || '',

        //Pagina 4
        objetivo, // objetivos nutricionales
        
        energia: document.getElementById('energia')?.value || '',
        hidratosDeCarbono: document.getElementById('hidratosDeCarbono')?.value || '',
        lipidos: document.getElementById('lipidos')?.value || '',
        proteinas: document.getElementById('proteinas')?.value || '',
        fibra: document.getElementById('fibra')?.value || '',
        agua: document.getElementById('agua')?.value || '',
    };
}

document.addEventListener('DOMContentLoaded', function() {
    // Implementación de paginación
    const paginas = document.querySelectorAll('.entrevista-pagina');
    const totalPaginas = paginas.length;
    
    // Si solo hay una página, eliminar la paginación
    if (totalPaginas <= 1) {
        document.querySelector('.pagination')?.remove();
        return;
    }
    
    // Referencias a elementos de paginación
    const btnPrev = document.createElement('a');
    btnPrev.className = 'pagination-previous';
    btnPrev.textContent = 'Anterior';
    
    const btnNext = document.createElement('a');
    btnNext.className = 'pagination-next';
    btnNext.textContent = 'Siguiente';
    
    const pageLinks = document.querySelectorAll('.pagination-link');
    const paginationContainer = document.querySelector('.entrevista-pagination');
    
    // Agregar botones al contenedor
    if (paginationContainer) {
        const nav = paginationContainer.querySelector('nav');
        nav.insertBefore(btnPrev, nav.firstChild);
        nav.appendChild(btnNext);
    }
    
    let paginaActual = 1;

    // Función para mostrar una página específica
    function showPage(pageNum) {
        // Validar el número de página
        pageNum = Math.max(1, Math.min(pageNum, totalPaginas));
        
        // Ocultar todas las páginas y mostrar la actual
        paginas.forEach((pagina, index) => {
            pagina.style.display = index === pageNum - 1 ? 'block' : 'none';
        });
        
        // Actualizar estado de los botones
        pageLinks.forEach(link => {
            const linkPage = parseInt(link.getAttribute('data-page'));
            link.classList.toggle('is-current', linkPage === pageNum);
        });
        
        // Actualizar botones anterior/siguiente
        btnPrev.classList.toggle('is-disabled', pageNum === 1);
        btnNext.classList.toggle('is-disabled', pageNum === totalPaginas);
        
        // Hacer scroll al principio de la página
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        paginaActual = pageNum;
    }

    // Event listeners
    pageLinks.forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            showPage(parseInt(link.getAttribute('data-page')));
        });
    });

    btnPrev.addEventListener('click', e => {
        e.preventDefault();
        if (paginaActual > 1) {
            showPage(paginaActual - 1);
        }
    });

    btnNext.addEventListener('click', e => {
        e.preventDefault();
        if (paginaActual < totalPaginas) {
            showPage(paginaActual + 1);
        }
    });

    // Mostrar primera página al cargar
    showPage(1);
});

