const request = require("request");
let planificador = require("./PlanificadorTareas");
let startApp = require("../../../StartApp.js");
let modeloJson = planificador.modeloJSON; // contiene todo el modelo JSON
let modeloObjeto = planificador.modeloOBJETO; // contiene los nodos CloudNode, FogNode, IoTGateway
let tipoEjecucion = startApp.tipoEjecucion;
let tipoApp = startApp.tipoApp;

console.log('\nIdentificando los nodos de computación (Edge, Fog y Cloud) especificados en el modelo y sus configuraciones de red...\n');
console.log('Distribuyendo la nueva versión de los modelos y los planes de implementación de los recursos de monitoreo a... ');

// Funcion para identificar los nodos de computación (Edge, Fog y Cloud)
function getPropiedadesNodos() {
  for (let nodoComputacion of modeloObjeto) {
    if ((nodoComputacion[0]['xsi:type'] == "MonitorIoT:CloudNode") || (nodoComputacion[0]['xsi:type'] == "MonitorIoT:FogNode") || (nodoComputacion[0]['xsi:type'] == "MonitorIoT:IoTGateway")) {
      nodoComputacion.forEach(propiedades => { // Recorro todas las propiedades de cada nodo
        propiedades.containsResource.forEach(datos => {
          if (datos['xsi:type'] == 'MonitorIoT:NetworkInterface') { // Obtengo los datos de la red del nodo
            let host = datos.networkAddress;
            let port = nodoComputacion[0].selfAwareMiddlewarePort;
            enviarInformacion(host, port, nodoComputacion);
          }
        })
      })
    }
  }

  setTimeout(function() {
    console.log('\x1b[31m%s\x1b[0m', 'Se ha establecido la nueva versión de los modelos como la configuración en ejecución del sistema IoT');
  }, 6000);

}
getPropiedadesNodos();
// Funcion para enviar la informacion a cada nodo, una vez se obtiene las configuraciones de red
function enviarInformacion(host, port, nodoComputacion) {
  const headers = {
    "content-type": "application/json",
  };
  if (host != "") {
    if (port != "") {
      url = "http://" + host + ":" + port + "/";
      request({
        url: url,
        headers: headers,
        body: JSON.stringify({
          "modeloJSON": modeloJson,
          "modeloOBJETO": nodoComputacion,
          "tipoEjecucion": tipoEjecucion,
          "tipoApp": tipoApp
        }),
        method: "POST",
      },
        (error, response, body) => {
          if (!error && (response && response.statusCode) === 200) {
            // console.log(`Información enviada al nodo: ${nodoComputacion[0]['xsi:type']} (puerto: ${port}......................\n)`); //mensaje original
            console.log(`Nodo: ${nodoComputacion[0]['xsi:type']} (puerto: ${port}, información enviada (OK)......................)`);

          } else {
            console.log(`No se pudo realizar la conexion a la direccion: http://${host}:${port}......................\n`);
          }
        }
      );
    }
  }
}
