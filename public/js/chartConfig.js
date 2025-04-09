document.addEventListener("DOMContentLoaded", function () {
    const canvas = document.getElementById('grafico');
    const filterButton = document.getElementById('filtrar-meses');
    const mesInicioSelect = document.getElementById('mes-inicio');
    const mesFinalSelect = document.getElementById('mes-final');

    // Parsear los datos desde los atributos data
    const originalLabels = JSON.parse(canvas.dataset.labels);
    const originalDatasets = JSON.parse(canvas.dataset.values);

    const ctx = canvas.getContext('2d');
    let myChart; // Variable para almacenar la instancia del gráfico

    // Meses en orden
    const mesesOrden = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    // Función para crear el gráfico
    function crearGrafico(labels, datasets) {
        // Destruir el gráfico existente si ya existe
        if (myChart) {
            myChart.destroy();
        }

        myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: datasets.map(dataset => ({
                    label: dataset.label,
                    data: dataset.data,
                    borderColor: dataset.borderColor,
                    fill: dataset.fill || false
                }))
            },
            options: {
                responsive: false,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: false
                    }
                },
                plugins: {
                    legend: {
                        position: 'top'
                    }
                }
            }
        });
    }

    // Crear gráfico inicial
    crearGrafico(originalLabels, originalDatasets);

    // Manejar el filtrado de meses
    filterButton.addEventListener('click', function() {
        const mesInicio = mesInicioSelect.value;
        const mesFinal = mesFinalSelect.value;

        // Validar que el mes de inicio sea menor o igual al mes final
        if (mesesOrden.indexOf(mesInicio) > mesesOrden.indexOf(mesFinal)) {
            alert('El mes de inicio debe ser anterior o igual al mes final');
            return;
        }

        // Encontrar el primer mes con datos
        const primerMesConDatos = originalLabels.find(mes => 
            mesesOrden.indexOf(mes) >= mesesOrden.indexOf(mesInicio)
        );

        // Encontrar el último mes con datos
        const ultimoMesConDatos = [...originalLabels].reverse().find(mes => 
            mesesOrden.indexOf(mes) <= mesesOrden.indexOf(mesFinal)
        );

        // Si no hay datos en el rango seleccionado
        if (!primerMesConDatos || !ultimoMesConDatos) {
            alert('No hay datos registrados en el periodo seleccionado');
            return;
        }

        // Filtrar labels
        const filteredLabels = originalLabels.slice(
            originalLabels.indexOf(primerMesConDatos), 
            originalLabels.indexOf(ultimoMesConDatos) + 1
        );

        // Filtrar datasets
        const filteredDatasets = originalDatasets.map(dataset => ({
            ...dataset,
            data: dataset.data.slice(
                originalLabels.indexOf(primerMesConDatos), 
                originalLabels.indexOf(ultimoMesConDatos) + 1
            )
        }));

        // Crear nuevo gráfico con datos filtrados
        crearGrafico(filteredLabels, filteredDatasets);
    });
});