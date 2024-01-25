// Empieza aqui 
// Verifica el tipo de ejecucion
// Si es uno solo realizo monitoreo/Ejecutor Tareas Monitoreo
// Si es dos ejecuto tanto monitoreo como autoconsciencia

const { exec } = require('child_process');
let recolector = require('../../Comunicacion/General/Recolector');
let tipoEjecucion = 2; 

if (tipoEjecucion === 1) {
  console.log('\n\x1b[32m%s\x1b[0m', 'MOTOR DE SINCRONIZACION DE RECURSOS DE MONITOREO');

  setTimeout(() => {
    ImplementadorBD()
  }, 2000);

  setTimeout(() => {
    ejecutorTareasMonitoreo()
  }, 4000)

  /* setTimeout(() => {
      ejecutorTareasAutoconsciencia()   
  }, 4000) */
} else {
  // Codigo para ejecutar tanto monitoreo como autoconsciencia 
  console.log("\x1b[31m%s\x1b[0m", "Receptando una nueva versión de los modelos y los planes de implementación de los recursos de monitoreo y autoconsciencia desde el nodo supervisor...")
  console.log('\n\x1b[34m%s\x1b[0m', 'MOTOR DE SINCRONIZACION DE RECURSOS DE MONITOREO Y AUTOCONSCIENCIA');
  setTimeout(() => {
    ImplementadorBD()
  }, 2000);
  setTimeout(() => {
    ejecutorTareasMonitoreo()
  }, 4000);
  ejecutorTareasAutoconsciencia();
}

function ejecutorTareasMonitoreo() {
  require('../Monitoreo/EjecutorTareasMonitoreo')
}

function ejecutorTareasAutoconsciencia() {
  require('../Autoconsciencia/EjecutorTareasAutoconsciencia')
}

function ImplementadorBD() {
  require('../General/ImplementadorBD')
}
