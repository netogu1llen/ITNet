document.addEventListener('DOMContentLoaded', function () {
  const btnGuardar = document.getElementById('btnGuardar');

  if (btnGuardar) {
    btnGuardar.addEventListener('click', async function (e) {
      e.preventDefault();

      const idExpediente = document.getElementById('idExpediente')?.value;

      if (!idExpediente) {
        console.error('No se encontró IDExpediente.');
        return;
      }

      const datos = {
        IDExpediente: idExpediente,
        diabetes: document.getElementById('diabetes')?.value || '',
        cancer: document.getElementById('cancer')?.value || '',
        dislipidemia: document.getElementById('dislipidemia')?.value || '',
        obesidad: document.getElementById('obesidad')?.value || '',
        anemia: document.getElementById('anemia')?.value || '',
        hipertensionArterial: document.getElementById('hipertensionArterial')?.value || '',
        pesoNacer: document.getElementById('pesoNacer')?.value || '',
        tallaNacer: document.getElementById('tallaNacer')?.value || '',
        alimentacionRecibida: document.getElementById('alimentacionRecibida')?.value || '',
        sdg: document.getElementById('sdg')?.value || '',
        tipoParto: document.getElementById('tipoParto')?.value || '',
        complicaciones: document.getElementById('complicaciones')?.value || '',
        lactancia: document.getElementById('lactancia')?.value || '',
        tiempo: document.getElementById('tiempo')?.value || '',
        edadAlimentacionComplementaria: document.getElementById('edadAlimentacionComplementaria')?.value || '',
        alimentosPrimerAnio: document.getElementById('alimentosPrimerAnio')?.value || ''
      };

      console.log('Datos a enviar:', datos);

      try {
        const respuesta = await fetch('/nutricion/historiaClinica/guardarHistoriaClinicaV1', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(datos)
        });

        const resultado = await respuesta.json();
        console.log('Respuesta del servidor:', resultado);

        if (resultado.success) {
          alert('Datos guardados correctamente');
        } else {
          alert('Error al guardar datos');
        }
      } catch (error) {
        console.error('Error al enviar datos:', error);
      }
    });
  } else {
    console.error('No se encontró botón #btnGuardar');
  }
});
