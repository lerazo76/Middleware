const request = require("request");
let planificador = require("./PlanificadorTareas");
let startApp = require("../../../StartApp.js");
let json = planificador.json;
let arreglo = planificador.arreglo;
let tipoEjecucion = startApp.tipoEjecucion;
const fs = require("fs");

/* recorro el arreglo de objetos de nodos de alex */

/* for para recorrer cada NODO */

/* recorrido del objeto 
for (let entity of containsEntityList) {
    if (entity.$["xsi:type"] == "MonitorIoT:CloudNode" || entity.$["xsi:type"] == "MonitorIoT:FogNode" || entity.$["xsi:type"] == "MonitorIoT:IoTGateway") {
    //if (entity.$["xsi:type"] === "MonitorIoT:CloudNode"){ 
      console.log("sendInformation = "+entity.$["xsi:type"]);
      enviarInformacion(entity,json);
    }  
}*/

/* for(let entity of arreglo){
 
  if(entity.valor == "MonitorIoT:CloudNode"){
    let port = entity.objetoPadre.$.selfAwareMiddlewarePort;
    let host = entity.objetoPadre.containsResource[1].$.networkAddress;
    enviarInformacion(host, port,json);
  }
} */


// arreglo -arregloNodos
// entity - nodoComputacion
for(let entity of arreglo){
  if((entity[0]['xsi:type'] == "MonitorIoT:CloudNode") || (entity[0]['xsi:type'] == "MonitorIoT:FogNode") || (entity[0]['xsi:type'] == "MonitorIoT:IoTGateway")){
    // datos - propiedades
    for(let datos of entity){
      console.log(datos);
      for(let red of datos.containsResource){
        if(red['xsi:type']=='MonitorIoT:NetworkInterface'){ 
          let host = red.networkAddress;
          let port = entity[0].selfAwareMiddlewarePort;
          //console.log(`Enviando datos al Nodo ${entity[0]['xsi:type']} port: ${port}` );
          // pasar todo el json
          // pasar todo el modeloObjeto
          enviarInformacion(host, port, datos)
        }
      }
    }
  } 
}

/*  */
/* funcion para enviar la informacion, obteniendo el host de cada nodo */
function enviarInformacion(host, port, json) {
  const headers = {
    "content-type": "application/json",
  };
  if (host != "") {    
    if (port != "") {
      url = "http://" + host + ":" + port + "/";
      request(
        {
          // enviando modelo de arquitectura y autoconciencia nodo y la IP
          // modeloObjeto
          // modeloJson
          url: url,
          headers: headers,
          body: JSON.stringify({
            data: json,
            objetos: json,
            tipoEjecucion: tipoEjecucion,
          }),
          method: "POST",
        },
        (error, response, body) => {
          if (!error && response.statusCode == 200) {
            console.log("MAL");
          } else {
            console.log(error);
          }
        }
      );
    }
  }
}
