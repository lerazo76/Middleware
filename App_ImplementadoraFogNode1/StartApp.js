
recolector();
// ejecutorTareasMonitoreo();
ejecutorTareasAutoconsciencia();


// funcion para llamar al recolector
function recolector(){
  require('./src/Comunicacion/General/Recolector');
};

function ejecutorTareasMonitoreo(){
  require('./src/LogicaNegocio/Monitoreo/EjecutorTareasMonitoreo')
}

//funcion para llamar a las tareas de autoconsciencia, esta se debe cambiar y se debe llamar al LogicaNegocio/General/EjecutorTareas y ahi llamar a EjecutorTareasAutoconsciencia

function ejecutorTareasAutoconsciencia(){
  require('./src/LogicaNegocio/Autoconsciencia/EjecutorTareasAutoconsciencia'); 
}
