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

for(let entity of arreglo){
  if(entity.valor == "MonitorIoT:CloudNode"){
    let port = entity.objetoPadre.$.selfAwareMiddlewarePort;
    let host = entity.objetoPadre.containsResource[1].$.networkAddress;
    enviarInformacion(host, port,json);
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
          url: url,
          headers: headers,
          body: JSON.stringify({
            data: json,
            objetos: arreglo,
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
