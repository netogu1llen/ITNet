document.addEventListener('DOMContentLoaded', function() {
    const tablaIndicadores = document.getElementById('tabla-indicadores');
    const tablaObjetivos = document.getElementById('tabla-objetivos');
    const btnAgregarIndicador = document.getElementById('btn-agregar-indicador');
    const btnAgregarObjetivo = document.getElementById('btn-agregar-objetivo');
    const pesoInput = document.getElementById('peso');
    const tallaInput = document.getElementById('talla');
    const imcInput = document.getElementById('imc');

    // Función para agregar nuevo indicador bioquímico
    if (btnAgregarIndicador) {
        btnAgregarIndicador.addEventListener('click', function(e) {
            e.preventDefault();
            const tbody = tablaIndicadores.querySelector('tbody');
            const nuevaFila = document.createElement('tr');
            nuevaFila.innerHTML = `
                <td><input class="input" type="text" name="parametroBioquimico[]" placeholder="Parámetro..." required></td>
                <td><input class="input" type="text" name="valorReferencia[]" placeholder="Valor de referencia..." required></td>
                <td><input class="input" type="date" name="fechaParametro[]" required></td>
                <td><button type="button" class="button is-danger btn-eliminar-fila">-</button></td>
            `;
            tbody.appendChild(nuevaFila);
            configurarBotonesEliminar();
        });
    }

    // Función para agregar nuevo objetivo
    if (btnAgregarObjetivo) {
        btnAgregarObjetivo.addEventListener('click', function(e) {
            e.preventDefault();
            const tbody = tablaObjetivos.querySelector('tbody');
            const nuevaFila = document.createElement('tr');
            nuevaFila.innerHTML = `
                <td><input class="input" type="text" name="objetivos[]" placeholder="Objetivo..." required></td>
                <td><button type="button" class="button is-danger btn-eliminar-fila">-</button></td>
            `;
            tbody.appendChild(nuevaFila);
            configurarBotonesEliminar();
        });
    }

    // Configurar botones para eliminar filas
    function configurarBotonesEliminar() {
        document.querySelectorAll('.btn-eliminar-fila').forEach(btn => {
            btn.onclick = function() {
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

    // Calcular IMC automáticamente
    function calcularIMC() {
        if (pesoInput?.value && tallaInput?.value) {
            const peso = parseFloat(pesoInput.value);
            const talla = parseFloat(tallaInput.value);
            if (peso > 0 && talla > 0) {
                const imc = (peso / (talla * talla)).toFixed(2);
                imcInput.value = imc;
            }
        }
    }

    if (pesoInput && tallaInput) {
        pesoInput.addEventListener('input', calcularIMC);
        tallaInput.addEventListener('input', calcularIMC);
    }

    // Configurar el guardado del formulario
    document.querySelectorAll('.btn-guardar').forEach(btn => {
        btn.addEventListener('click', async function(e) {
            e.preventDefault();
            
            // Validar campos requeridos
            const camposRequeridos = document.querySelectorAll('input[required]');
            let todosCamposLlenos = true;
            
            camposRequeridos.forEach(campo => {
                if (!campo.value.trim()) {
                    todosCamposLlenos = false;
                    campo.classList.add('is-danger');
                } else {
                    campo.classList.remove('is-danger');
                }
            });

            if (!todosCamposLlenos) {
                Swal.fire({
                    title: 'Error',
                    text: 'Por favor complete todos los campos requeridos',
                    icon: 'error'
                });
                return;
            }

            // Recopilar datos del formulario
            const formData = {
                IDExpediente: document.getElementById('idExpediente')?.value,
                numSesion: document.getElementById('numSesion')?.value,
                
                // Indicadores bioquímicos
                parametrosBioquimicos: Array.from(document.querySelectorAll('input[name="parametroBioquimico[]"]')).map(input => input.value),
                valoresReferencia: Array.from(document.querySelectorAll('input[name="valorReferencia[]"]')).map(input => input.value),
                fechasParametro: Array.from(document.querySelectorAll('input[name="fechaParametro[]"]')).map(input => input.value),
                
                // Evaluación antropométrica
                peso: pesoInput?.value,
                talla: tallaInput?.value,
                imc: imcInput?.value,
                
                // Diagnósticos
                diagnosticos: document.getElementById('diagnosticos')?.value,
                
                // Objetivos nutricionales
                objetivos: Array.from(document.querySelectorAll('input[name="objetivos[]"]')).map(input => input.value),
                
                // Manejo nutricional
                energia: document.getElementById('energia')?.value,
                proteinas: document.getElementById('proteinas')?.value,
                lipidos: document.getElementById('lipidos')?.value,
                hidratosCarbono: document.getElementById('hidratosCarbono')?.value,
                fibra: document.getElementById('fibra')?.value,
                agua: document.getElementById('agua')?.value
            };

            try {
                const response = await fetch('/nutricion/historiaClinica/guardarHistoriaClinicaV2', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();

                if (result.success) {
                    Swal.fire({
                        title: '¡Éxito!',
                        text: 'Los datos se han guardado correctamente',
                        icon: 'success'
                    }).then(() => {
                        window.location.href = `/nutricion/documentos/${formData.IDExpediente}`;
                    });
                } else {
                    throw new Error(result.message);
                }
            } catch (error) {
                Swal.fire({
                    title: 'Error',
                    text: error.message || 'Error al guardar los datos',
                    icon: 'error'
                });
            }
        });
    });

    // Inicializar
    configurarBotonesEliminar();
    calcularIMC();
});
