document.addEventListener('DOMContentLoaded', function() {
    // Configuración de paginación
    const paginationLinks = document.querySelectorAll('.pagination-link');
    const pages = document.querySelectorAll('.entrevista-pagina');
    
    paginationLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remover clase activa de todos los links
            paginationLinks.forEach(l => l.classList.remove('is-current'));
            
            // Agregar clase activa al link actual
            this.classList.add('is-current');
            
            // Obtener número de página
            const pageNum = parseInt(this.getAttribute('data-page'));
            
            // Ocultar todas las páginas
            pages.forEach(page => page.style.display = 'none');
            
            // Mostrar la página seleccionada
            pages[pageNum - 1].style.display = 'block';
        });
    });

    // Manejo de tablas dinámicas (indicadores bioquímicos)
    const btnAgregarFila = document.getElementById('btn-agregar-fila');
    const tablaIndicadores = document.getElementById('tabla-indicadores');

    if (btnAgregarFila && tablaIndicadores) {
        btnAgregarFila.addEventListener('click', function(e) {
            e.preventDefault();
            
            const nuevaFila = document.createElement('tr');
            nuevaFila.innerHTML = `
                <td><input class="input" type="text" name="parametroBioquimico[]" placeholder="Parámetro..." required></td>
                <td><input class="input" type="text" name="valorReferencia[]" placeholder="Valor de referencia..." required></td>
                <td><input class="input" type="date" name="fechaParametro[]" required></td>
                <td><button type="button" class="button is-danger btn-eliminar-fila">-</button></td>
            `;

            tablaIndicadores.appendChild(nuevaFila);
            configurarBotonesEliminarFila();
        });
    }

    // Manejo de tabla de objetivos nutricionales
    const btnAgregarObjetivo = document.getElementById('btn-agregar-fila-objetivos');
    const tablaObjetivos = document.getElementById('tabla-objetivos');

    if (btnAgregarObjetivo && tablaObjetivos) {
        btnAgregarObjetivo.addEventListener('click', function(e) {
            e.preventDefault();
            
            const nuevaFila = document.createElement('tr');
            nuevaFila.innerHTML = `
                <td>
                    <input class="input" type="text" name="objetivosNutricionales[]" placeholder="Objetivo..." required>
                </td>
                <td>
                    <button type="button" class="button is-danger btn-eliminar-fila">-</button>
                </td>
            `;

            tablaObjetivos.appendChild(nuevaFila);
            configurarBotonesEliminarFila();
        });
    }

    // Función para configurar botones de eliminar en todas las tablas
    function configurarBotonesEliminarFila() {
        const botonesEliminar = document.querySelectorAll('.btn-eliminar-fila');
        botonesEliminar.forEach(boton => {
            boton.onclick = function() {
                const tabla = this.closest('tbody');
                if (tabla.children.length > 1) {
                    this.closest('tr').remove();
                } else {
                    Swal.fire({
                        title: 'Aviso',
                        text: 'Debe mantener al menos una fila',
                        icon: 'warning'
                    });
                }
            };
        });
    }

    // Configurar inicialmente todos los botones de eliminar
    configurarBotonesEliminarFila();

    // Cálculo automático de IMC y otros índices cuando se cambian peso o talla
    const pesoInput = document.getElementById('peso');
    const tallaInput = document.getElementById('talla');
    const imcInput = document.getElementById('imc');
    const circunferenciaCinturaInput = document.getElementById('circunferenciaCintura');
    const circunferenciaCaderaInput = document.getElementById('circunferenciaCadera');
    const indiceCinturaCaderaInput = document.getElementById('indiceCinturaCadera');

    function calcularIMC() {
        if (pesoInput && tallaInput && imcInput) {
            const peso = parseFloat(pesoInput.value);
            const talla = parseFloat(tallaInput.value);
            
            if (!isNaN(peso) && !isNaN(talla) && talla > 0) {
                const imc = (peso / (talla * talla)).toFixed(2);
                imcInput.value = imc;
            }
        }
    }

    function calcularIndiceCinturaCadera() {
        if (circunferenciaCinturaInput && circunferenciaCaderaInput && indiceCinturaCaderaInput) {
            const cintura = parseFloat(circunferenciaCinturaInput.value);
            const cadera = parseFloat(circunferenciaCaderaInput.value);
            
            if (!isNaN(cintura) && !isNaN(cadera) && cadera > 0) {
                const indice = (cintura / cadera).toFixed(2);
                indiceCinturaCaderaInput.value = indice;
            }
        }
    }

    if (pesoInput) pesoInput.addEventListener('input', calcularIMC);
    if (tallaInput) tallaInput.addEventListener('input', calcularIMC);
    if (circunferenciaCinturaInput) circunferenciaCinturaInput.addEventListener('input', calcularIndiceCinturaCadera);
    if (circunferenciaCaderaInput) circunferenciaCaderaInput.addEventListener('input', calcularIndiceCinturaCadera);

    // Ejecutar los cálculos iniciales
    calcularIMC();
    calcularIndiceCinturaCadera();

    // Validaciones para campos numéricos
    const camposNumericos = document.querySelectorAll('input[type="number"]');
    camposNumericos.forEach(campo => {
        campo.addEventListener('input', function() {
            // Remover caracteres no numéricos excepto punto y guión
            this.value = this.value.replace(/[^\d.-]/g, '');
            
            // Validar rango según el campo
            if (this.id === 'peso') {
                if (parseFloat(this.value) > 500) this.value = 500;
                if (parseFloat(this.value) < 0) this.value = 0;
            }
            if (this.id === 'talla') {
                if (parseFloat(this.value) > 3) this.value = 3;
                if (parseFloat(this.value) < 0) this.value = 0;
            }
        });
    });

    // Validaciones para límites de caracteres
    const campos = document.querySelectorAll('input[type="text"], textarea');
    campos.forEach(campo => {
        // Establecer maxLength según el campo
        if (campo.id) {
            switch(campo.id) {
                case 'observaciones':
                case 'logrosAlcanzados':
                case 'areasOportunidad':
                    campo.maxLength = 500;
                    break;
                case 'energia':
                case 'proteinas':
                case 'lipidos':
                case 'hidratosDeCarbono':
                case 'fibra':
                case 'agua':
                    campo.maxLength = 10;
                    break;
                default:
                    campo.maxLength = 255; // Límite por defecto
            }
        }
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
        if (pesoInput && (isNaN(pesoInput.value) || parseFloat(pesoInput.value) <= 0)) {
            errores.push('El peso debe ser un número mayor a 0');
        }
        if (tallaInput && (isNaN(tallaInput.value) || parseFloat(tallaInput.value) <= 0)) {
            errores.push('La talla debe ser un número mayor a 0');
        }

        return errores;
    }

    // Manejo del guardado de datos
    const modoEdicion = document.getElementById('idExpediente').dataset.modoEdicion === 'true';
    const botonesGuardar = document.querySelectorAll('.btn-guardar');

    botonesGuardar.forEach(boton => {
        boton.textContent = modoEdicion ? 'Actualizar' : 'Guardar';
        
        boton.addEventListener('click', async function(e) {
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
            const url = modoEdicion 
                ? '/nutricion/historiaClinica/actualizarHistoriaClinicaV2' 
                : '/nutricion/historiaClinica/guardarHistoriaClinicaV2';

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
                        text: modoEdicion ? "Seguimiento actualizado correctamente." : "Seguimiento guardado correctamente.",
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

    // Para indicadores bioquímicos:
    const parametro = Array.from(document.querySelectorAll('input[name="parametroBioquimico[]"]')).map(input => input.value.trim());
    const valorReferencia = Array.from(document.querySelectorAll('input[name="valorReferencia[]"]')).map(input => input.value.trim());
    const parametroFecha = Array.from(document.querySelectorAll('input[name="fechaParametro[]"]')).map(input => input.value.trim());

    // Para objetivos nutricionales:
    const objetivo = Array.from(document.querySelectorAll('input[name="objetivosNutricionales[]"]')).map(input => input.value.trim());
    const estadoObjetivo = Array.from(document.querySelectorAll('select[name="estadoObjetivo[]"]')).map(select => select.value);

    return {
        IDExpediente: idExpediente,
        
        // Datos de seguimiento
        numSesion: document.getElementById('numSesion')?.value || '',
        fechaSeguimiento: document.getElementById('fechaSeguimiento')?.value || '',
        
        // Cambios desde última visita
        cambiosMedicacion: document.getElementById('cambiosMedicacion')?.value || '',
        cambiosActividadFisica: document.getElementById('cambiosActividadFisica')?.value || '',
        cambiosSintomas: document.getElementById('cambiosSintomas')?.value || '',
        nuevosDiagnosticos: document.getElementById('nuevosDiagnosticos')?.value || '',
        
        // Adherencia al plan
        gradoCumplimiento: document.getElementById('gradoCumplimiento')?.value || '',
        dificultades: document.getElementById('dificultades')?.value || '',
        alimentosNoTolerados: document.getElementById('alimentosNoTolerados')?.value || '',
        
        // Indicadores bioquímicos
        parametro, 
        valorReferencia,
        parametroFecha,
        
        // Evaluación antropométrica
        talla: document.getElementById('talla')?.value || '',
        peso: document.getElementById('peso')?.value || '',
        imc: document.getElementById('imc')?.value || '',
        circunferenciaCintura: document.getElementById('circunferenciaCintura')?.value || '',
        circunferenciaCadera: document.getElementById('circunferenciaCadera')?.value || '',
        indiceCinturaCadera: document.getElementById('indiceCinturaCadera')?.value || '',
        cambioTalla: document.getElementById('cambioTalla')?.value || '',
        cambioPeso: document.getElementById('cambioPeso')?.value || '',
        cambioIMC: document.getElementById('cambioIMC')?.value || '',
        cambioCintura: document.getElementById('cambioCintura')?.value || '',
        cambioCadera: document.getElementById('cambioCadera')?.value || '',
        cambioIndice: document.getElementById('cambioIndice')?.value || '',
        
        // Evaluación de progreso
        logrosAlcanzados: document.getElementById('logrosAlcanzados')?.value || '',
        areasOportunidad: document.getElementById('areasOportunidad')?.value || '',
        
        // Diagnóstico actualizado
        diagnosticoActual: document.getElementById('diagnosticoActual')?.value || '',
        cambiosDiagnostico: document.getElementById('cambiosDiagnostico')?.value || '',
        
        // Objetivos nutricionales
        objetivo,
        estadoObjetivo,
        
        // Manejo nutricional
        energia: document.getElementById('energia')?.value || '',
        hidratosDeCarbono: document.getElementById('hidratosDeCarbono')?.value || '',
        lipidos: document.getElementById('lipidos')?.value || '',
        proteinas: document.getElementById('proteinas')?.value || '',
        fibra: document.getElementById('fibra')?.value || '',
        agua: document.getElementById('agua')?.value || '',
        cambioEnergia: document.getElementById('cambioEnergia')?.value || '',
        cambioHidratos: document.getElementById('cambioHidratos')?.value || '',
        cambioLipidos: document.getElementById('cambioLipidos')?.value || '',
        cambioProteinas: document.getElementById('cambioProteinas')?.value || '',
        cambioFibra: document.getElementById('cambioFibra')?.value || '',
        cambioAgua: document.getElementById('cambioAgua')?.value || '',
        
        // Observaciones y próxima cita
        observaciones: document.getElementById('observaciones')?.value || '',
        fechaProxCita: document.getElementById('fechaProxCita')?.value || ''
    };
}