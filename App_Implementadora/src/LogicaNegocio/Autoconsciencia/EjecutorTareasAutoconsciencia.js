const modeloNodo = require("../../../modelos/modeloObjeto.json"); //importando el modelo de arquitectura correspondiente al nodo
const nodoComputacion = modeloNodo[0]["xsi:type"]; //se obtiene el nodo de computacion sobre el que se esta trabajando
const start = require('../../../StartApp');
const tipoApp = start.app;


ejecutarTareasAutoconsciencia(nodoComputacion); //ejecutar las tareas de autoconsciencia

//funcion para ejecutar las tareas de autoconsciencia pasando el nodo de computacion en el que se esta trabajando
function ejecutarTareasAutoconsciencia(nodoComputacion){ 
  if (tipoApp==2 || tipoApp==0){
    console.log("Implementando/reconfigurando los recursos de operacionalizacion...");
  }
  ImplementadorDemoniosPreReflexivos(nodoComputacion);
  ImplementadorDemoniosReflexivos(nodoComputacion);  
  
}
//funcion para recuperar y ejecutar los demonios de los procesos de autoconsciencia pre-reflexivos
async function ImplementadorDemoniosPreReflexivos(nodoComputacion) {
  const execute = require("../Autoconsciencia/ImplementadorDemoniosPreReflexivos");
  await execute.ejecutarDemoniosControlados(nodoComputacion);
}
//funcion para recuperar y ejecutar los demonios de los procesos de autoconsciencia reflexivos
async function ImplementadorDemoniosReflexivos() {
  const execute = require("../Autoconsciencia/ImplementadorDemoniosReflexivos");
  await execute.ejecutarDemoniosControlados(nodoComputacion);
}


module.exports = {
  ejecutarTareasAutoconsciencia
};