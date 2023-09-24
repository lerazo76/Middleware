// Empieza aqui 
// Verifica el tipo de ejecucion
// Si es uno solo realizo monitoreo/Ejecutor Tareas Monitoreo
// Si es dos ejecuto tanto monitoreo como autoconsciencia

let recolector = require('../../Comunicacion/General/Recolector');
let tipoEjecucion = recolector.tipoEjecucion;
tipoEjecucion = 1; // Revisar OJOOOOOOOO

if (tipoEjecucion === 1){
    console.log('\n\x1b[32m%s\x1b[0m', 'MOTOR DE SINCRONIZACION DE RECURSOS DE MONITOREO');
    
    /* setTimeout(() => {
        ImplementadorBD()
    }, 2000); */

    setTimeout(() => {
        ejecutorTareasMonitoreo()   
    }, 4000)
     
}else{
    // Codigo para ejecutar tanto monitoreo como autoconsciencia 
}

function ejecutorTareasMonitoreo(){
    require('../Monitoreo/EjecutorTareasMonitoreo')
}

function ImplementadorBD(){
    require('../General/ImplementadorBD')
}

