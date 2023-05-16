const request = require("request");
let planificador = require("./PlanificadorTareas");
let startApp = require("../../../StartApp.js");
let json = planificador.json;
let tipoEjecucion = startApp.tipoEjecucion;
const fs = require("fs");

/* CODIGO ALEX */
fs.readFile("./modelos/modeloCO.json", "utf-8", (error, data) => { //lectura del json 
  if (error) {
    console.log("error");
  } else {
    data = JSON.parse(data);
    //prueba que si retorna containsreturnvariable en apis
    const nodosAPI = buscarValor(data, "MonitorIoT:API");
    //console.log(nodosAPI);
    //prueba que si retorna containsdatable en db
    const nodosDB = buscarValor(data, "MonitorIoT:DataBase");
    //console.log(nodosDB);
    //Network Interface
    const nodosNI = buscarValor(data,"MonitorIoT:NetworkInterface")
    /* for (var prop in nodosNI){
      console.log(nodosNI[prop]);
    } */
    //fin prueba si retorna
    // const nodosAPI2 = buscarValorTerminacion(data, ":API");
    // console.log(nodosAPI2);
  }
});


//Funcion para buscar en el json el parametro que se envie (API's, BD's, BROKER's)
function buscarValor(objeto, parametro) {
  const resultados = [];
  const pila = [{ objeto, objetoPadre: null, keyPadre: null }];
  while (pila.length > 0) {
    const { objeto: obj, objetoPadre, keyPadre } = pila.pop();
    for (const key in obj) {
      if (obj[key] === parametro) {
        const resultado = {
          valor: obj[key],
          keyPadre,
          objetoPadre: Object.assign({}, objetoPadre, { [keyPadre]: obj }),
        };
        resultados.push(resultado);
      } else if (typeof obj[key] === "object") {
        pila.push({ objeto: obj[key], objetoPadre: obj, keyPadre: key });
      }
    }
  }
  return resultados;
}
/*FIN CODIGO ALEX */

const containsEntityList = json["ArchitectureSelfAwarenessIoT"].containsEntity;
/* recorro el arreglo de objetos de nodos de alex */


/* for para recorrer cada NODO */

/* recorrido del objeto */
for (let entity of containsEntityList) {
    if (entity.$["xsi:type"] == "MonitorIoT:CloudNode" || entity.$["xsi:type"] == "MonitorIoT:FogNode" || entity.$["xsi:type"] == "MonitorIoT:IoTGateway") {
    //if (entity.$["xsi:type"] === "MonitorIoT:CloudNode"){ 
      console.log("sendInformation = "+entity.$["xsi:type"]);
      enviarInformacion(entity,json);
    }  
}

/* funcion para enviar la informacion, obteniendo el host de cada nodo */
function enviarInformacion(entity, json) {
  const headers = {
    "content-type": "application/json",
  };
  if (entity.containsResource && entity.containsResource.length > 0) {
    var host;
    nodosNI = buscarValor(entity.containsResource,"MonitorIoT:NetworkInterface")
    host = nodosNI[0].objetoPadre.$.networkAddress;
    if (host != "") {
      url = "http://" + host + "/";
      request(
        {
          url: url,
          headers: headers,
          body: JSON.stringify({
            data: json,
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
