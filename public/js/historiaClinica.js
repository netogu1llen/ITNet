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
      <td><button type="button" class="button is-cancel btn-eliminar-fila">-</button></td>
    `;

    tabla.appendChild(nuevaFila);

    configurarBotonesEliminarFila(); // Vuelve a configurar los botones de eliminar

    setTimeout(() => {
      document.querySelectorAll('input[type="date"]').forEach(input => {
        input.max = hoy;
      });
    }, 0);
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
        <button type="button" class="button is-cancel btn-eliminar-fila">-</button>
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

function validarFormulario() {
    let errores = [];
    // Objeto para mapear IDs a nombres más amigables
    const nombresCampos = {
        'numSesion': 'Número de Sesión',
        'diabetes': 'Diabetes',
        'cancer': 'Cáncer',
        'dislipidemia': 'Dislipidemia',
        'obesidad': 'Obesidad',
        'anemia': 'Anemia',
        'hipertensionArterial': 'Hipertensión Arterial',
        'pesoNacer': 'Peso al Nacer',
        'tallaNacer': 'Talla al Nacer',
        'alimentacionRecibida': 'Alimentación Recibida',
        'sdg': 'SDG',
        'complicaciones': 'Complicaciones',
        'tiempo': 'Tiempo',
        'edadAlimentacionComplementaria': 'Edad de Alimentación Complementaria',
        'alimentosPrimerAnio': 'Alimentos Primer Año',
        'peso': 'Peso',
        'talla': 'Talla'
    };
    
    const camposRequeridos = document.querySelectorAll('[required]');
    
    camposRequeridos.forEach(campo => {
        if (!campo.value.trim()) {
            // Usar el nombre amigable si existe, sino usar el ID o un texto genérico
            const nombreCampo = nombresCampos[campo.id] || campo.id || 'requerido';
            errores.push(`El campo "${nombreCampo}" está vacío`);
            campo.classList.add('is-danger');
        } else {
            campo.classList.remove('is-danger');
        }
    });

    // Validaciones específicas para campos numéricos
    const peso = document.getElementById('peso');
    const talla = document.getElementById('talla');

    if (peso && peso.value && (isNaN(peso.value) || parseFloat(peso.value) <= 0)) {
        errores.push('El peso debe ser un número mayor a 0');
        peso.classList.add('is-danger');
    }
    if (talla && talla.value && (isNaN(talla.value) || parseFloat(talla.value) <= 0)) {
        errores.push('La talla debe ser un número mayor a 0');
        talla.classList.add('is-danger');
    }

    // Validar tablas dinámicas
    const tablaIndicadores = document.getElementById('tabla-indicadores');
    if (tablaIndicadores) {
        const filasIndicadores = tablaIndicadores.querySelectorAll('tr');
        filasIndicadores.forEach((fila, index) => {
            if (index > 0) { // Saltamos la fila de encabezado
                const inputs = fila.querySelectorAll('input[required]');
                inputs.forEach(input => {
                    if (!input.value.trim()) {
                        errores.push(`Falta completar información en la fila ${index} de Indicadores Bioquímicos`);
                        input.classList.add('is-danger');
                    }
                });
            }
        });
    }

    return errores;
}

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
                        title: 'Campos Incompletos',
                        html: errores.join('<br>'),
                        icon: 'warning',
                        confirmButtonText: 'Entendido'
                    });
                    return;
                }

                const datos = recopilarDatosFormulario();
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

// Agregar funcionalidad al botón de cancelar
document.addEventListener('DOMContentLoaded', function() {
    const botonesCancelar = document.querySelectorAll('.btn-cancelar');
    
    botonesCancelar.forEach(boton => {
        boton.addEventListener('click', function() {
            Swal.fire({
                title: "Estás a punto de cancelar la operación",
                text: "¿Estás seguro?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Sí",
                cancelButtonText: "No"
            }).then((result) => {
                if (result.isConfirmed) {
                    Swal.fire("No se guardaron los cambios", "", "info").then(() => {
                        const idExpediente = document.getElementById('idExpediente').value;
                        window.location.href = `/nutricion/documentos/${idExpediente}`;
                    });
                }
            });
        });
    });
});

function recopilarDatosFormulario() {
    // Usamos el ID encriptado para operaciones de backend
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
        // Usar el ID encriptado para la base de datos
        IDExpediente: idExpediente,

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
    // Establecer fecha máxima para los datepickers
    const hoy = new Date().toISOString().split('T')[0];
    document.querySelectorAll('input[type="date"]').forEach(input => {
        input.max = hoy;
    });

    // Cuando se agrega una nueva fila, establecer la fecha máxima
    const botonAgregar = document.getElementById('btn-agregar-fila');
    if (botonAgregar) {
        botonAgregar.addEventListener('click', function() {
            setTimeout(() => {
                document.querySelectorAll('input[type="date"]').forEach(input => {
                    input.max = hoy;
                });
            }, 0);
        });
    }
});

document.addEventListener('DOMContentLoaded', function() {
    // Función para validar caracteres especiales
    function validarCaracteresEspeciales(e) {
        const caracteresProhibidos = /['"%;<>\\]/;
        if (caracteresProhibidos.test(e.key)) {
            e.preventDefault();
            return false;
        }
    }

    // Aplicar validación a todos los inputs de texto
    const textInputs = document.querySelectorAll('input[type="text"], textarea');
    textInputs.forEach(input => {
        input.addEventListener('keypress', validarCaracteresEspeciales);
        
        // Limpiar caracteres especiales al pegar texto
        input.addEventListener('paste', function(e) {
            e.preventDefault();
            const texto = (e.clipboardData || window.clipboardData).getData('text');
            const textoLimpio = texto.replace(/['"%;<>\\]/g, '');
            document.execCommand('insertText', false, textoLimpio);
        });
    });

    // Validación adicional al enviar el formulario
    function sanitizarValor(valor) {
        if (typeof valor === 'string') {
            return valor.replace(/['"%;<>\\]/g, '');
        }
        return valor;
    }

    // Modificar la función recopilarDatosFormulario
    const recopilarDatosOriginal = recopilarDatosFormulario;
    recopilarDatosFormulario = function() {
        const datos = recopilarDatosOriginal();
        // Sanitizar todos los valores string
        Object.keys(datos).forEach(key => {
            if (Array.isArray(datos[key])) {
                datos[key] = datos[key].map(val => sanitizarValor(val));
            } else {
                datos[key] = sanitizarValor(datos[key]);
            }
        });
        return datos;
    };
});

