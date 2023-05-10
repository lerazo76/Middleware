const request = require("request");
let planificador = require('./PlanificadorTareas');
let startApp = require('../../../StartApp.js');
let json = planificador.mod_json;
let tipoEjecucion = startApp.tipoEjecucion;

// Metodo para enviar la informacion
/* 3 for  */


/* CODIGO ALEX */
const containsEntityList = json['ArchitectureSelfAwarenessIoT'].containsEntity

/* for para recorrer cada NODO */
for (let entity of containsEntityList) {
    //if (entity.$["xsi:type"] == "MonitorIoT:CloudNode" || entity.$["xsi:type"] == "MonitorIoT:FogNode" || entity.$["xsi:type"] == "MonitorIoT:IoTGateway") {
    if (entity.$["xsi:type"] == "MonitorIoT:FogNode") {

        console.log("sendInformation = "+entity.$["xsi:type"]);
        enviarInformacion(entity,json);
    } 
}

/* funcion para enviar la informacion, obteniendo el host de cada nodo */
function enviarInformacion(entity, json){
    const headers = {
        'content-type': 'application/json'
    }
    if (entity.containsResource && entity.containsResource.length > 0) {
        let host = ''
        for(let resource of entity.containsResource){
            if(resource && resource.$['xsi:type'] == "MonitorIoT:NetworkInterface"){
                host = resource.$.networkAddress
            }
        }

        if (host != ""){
            url = "http://" + host + "/";
            request({
                url: url,
                headers: headers,
                body: JSON.stringify({
                    "data": json,
                    "tipoEjecucion": tipoEjecucion
                }),
                method: 'POST'            
             },(error, response, body)=>{
                if(!error && response.statusCode == 200){
                    console.log('MAL');
                }else{
                    console.log(error);
                }
            });
        }
    }
} 

