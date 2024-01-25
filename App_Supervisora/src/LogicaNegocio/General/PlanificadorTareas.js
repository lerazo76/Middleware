// PLANIFICADOR TAREAS
// Se encarga de comparar la nueva version detectada del modelo arquitectura de monitoreo con la configuracion de monitoreo en ejecucion del sistema.

const fs = require("fs");
let StartApp = require("../../../StartApp");
const { log } = require("console");
let filePath = StartApp.filePath;
let tipoEjecucion = StartApp.tipoEjecucion;
let tipoApp = StartApp.tipoApp;
let json = JSON.parse(fs.readFileSync("./modelos/Modelo.json", "utf8"));

//unificando
// const funciones = require("../../../../Funciones");
const funciones = require("../../../Funciones");

// Verificamos el tipo de ejecucion ya sea Monitoreo o Monitoreo y Autoconciencia
if (tipoEjecucion == 2) {
  if(tipoApp == 2){
    console.log('\n\x1b[32m%s\x1b[0m', 'MOTOR DE SINCRONIZACION DE RECURSOS DE MONITOREO');
    console.log('\x1b[32m%s\x1b[0m', 'Planificando tareas de implementación o reconfiguración de artefactos de monitoreo...');
    console.log('\n\x1b[34m%s\x1b[0m', 'MOTOR DE SINCRONIZACION DE RECURSOS DE AUTOCONSCIENCIA');
    console.log('\n\x1b[34m%s\x1b[0m', 'Comparando la nueva versión del modelo de autoconsciencia con la version actual en ejecución...');
    console.log('\x1b[34m%s\x1b[0m', 'Planificando tareas de implementación o reconfiguración de artefactos de autoconsciencia...');
  }else{
    console.log('\n\x1b[32m%s\x1b[0m', 'MOTOR DE SINCRONIZACION DE RECURSOS DE MONITOREO');
    console.log('\x1b[32m%s\x1b[0m', 'Planificando tareas de implementación o reconfiguración de artefactos de monitoreo...');
  }
}else{
  console.log('\x1b[32m%s\x1b[0m', 'MOTOR DE SINCRONIZACION DE RECURSOS DE MONITOREO');
  console.log('\x1b[32m%s\x1b[0m', 'Planificando tareas de implementación o reconfiguración de artefactos de monitoreo...');
}

// Convertir el modeloJSON en un arreglo de objetos, identificamos los nodos de computacion Edge, Fog y Cloud
const arregloNodos = [];
const nodosCloud = funciones.buscarValor(json, "MonitorIoT:CloudNode", 4);
const nodosFog = funciones.buscarValor(json, "MonitorIoT:FogNode", 4);
const nodosIotGateway = funciones.buscarValor(json, "MonitorIoT:IoTGateway", 4);
arregloNodos.push(nodosCloud);
arregloNodos.push(nodosFog);
arregloNodos.push(nodosIotGateway);

module.exports = {
    modeloJSON: json, // contiene todo el modelo JSON
    modeloOBJETO: arregloNodos // contiene los nodos CloudNode, FogNode, IoTGateway
}

orquestador(); 

// Llamamos al archivo Orquestador
function orquestador() {
  require("./Orquestador");
}
