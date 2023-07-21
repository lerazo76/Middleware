ejecutorTareasMonitoreo();
recolector();


// funcion para llamar al recolector
function recolector(){
  require('./src/Comunicacion/General/Recolector');
};

function ejecutorTareasMonitoreo(){
  require('./src/LogicaNegocio/Monitoreo/EjecutorTareasMonitoreo')
}