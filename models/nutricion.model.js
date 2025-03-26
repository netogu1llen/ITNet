const mockData = [
    { id: 1, nombre: 'Jonathan Dario Guillen', fecha: '12 de Marzo de 2025' },
    { id: 2, nombre: 'Camila Rojas', fecha: '10 de Marzo de 2025' },
    { id: 3, nombre: 'Luis Ruiz', fecha: '08 de Marzo de 2025' }
  ];
  
  function getAllHistoriales() {
    return mockData;
  }
  
  module.exports = { getAllHistoriales };
  