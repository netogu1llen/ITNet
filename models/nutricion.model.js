const mockData = [
    { id: 1, nombre: 'Jonathan Dario Guillen', fecha: '12 de Marzo de 2025' },
    { id: 2, nombre: 'Camila Rojas', fecha: '10 de Marzo de 2025' },
    { id: 3, nombre: 'Luis Ruiz', fecha: '08 de Marzo de 2025' }
  ];
  
  function getAllHistoriales() {
    return mockData;
  }
    
const planesAlimenticiosMock = [
  { id: 1, nombre: 'Paciente Uno', fecha: '2025-03-01' },
  { id: 2, nombre: 'Paciente Dos', fecha: '2025-03-05' },
  { id: 3, nombre: 'Paciente Tres', fecha: '2025-03-10' }
];

function getAllPlanesAlimenticios() {
  return planesAlimenticiosMock;
}

module.exports = {
  getAllHistoriales,
  getAllPlanesAlimenticios
};
