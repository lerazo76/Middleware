let modelo = require('../../../modelos/modeloObjeto');
/* const { getApis } = require('../../Datos/BD'); */

console.log('\n\x1b[32m%s\x1b[0m', 'Implementando las funciones APIs ...');

// Buscamos en el modelo todas la propiedad APIS para crear
modelo.forEach((resource, index) => {
    let nuevaAPI = "";
    resource.containsResource.forEach((propiedades)=>{
        if(propiedades['xsi:type'] == 'MonitorIoT:API'){
            nuevaAPI = codigoApis(propiedades);
            eval(nuevaAPI);
            console.log('\n\x1b[32m%s\x1b[0m', `API ${propiedades.name} implementada (OK)`);
        }
    })
});

// Codigo para crear las nuevas APIS
function codigoApis(propiedades){
    let newAPI = "";
    newAPI += "exports."+propiedades.name+" = function ("; 
    // Agrego los parametros en caso la API tenga contains parameter
    propiedades && propiedades.containsParameter && propiedades.containsParameter.forEach((parameters, i) => {
        newAPI += parameters.name + ((i===propiedades.containsParameter.length-1) ? "" : ",");
    })
    newAPI += "){\n" + propiedades.instructions + "\n}"; 
    return newAPI;
}

// Funcion para obtener la api de acuerdo al link del servicio
exports.getApis = function(globalConfig, index){
    const references = [];
    const link = globalConfig["ArchitectureSelfAwarenessIoT"].containsLink[index-0];
    let refList = [];
    if (link.$.linksAPI) refList = link.$.linksAPI.split("/@");
    let auxObjRef = globalConfig["ArchitectureSelfAwarenessIoT"];
    for (let i = 1; i < refList.length; i++) {
        let str = refList[i];
        auxObjRef = auxObjRef[str.split(".")[0]][str.split(".")[1]];
        references.push(auxObjRef);
    }
    return references;
};

// Funcion para obtener la api de acuerdo al link del servicio
exports.getApisService = function(globalConfig, index){
    
    const references = [];
    const link = globalConfig["ArchitectureSelfAwarenessIoT"].containsLink[index-0];
    let refList = [];
    if (link.$.linksService) refList = link.$.linksService.split("/@");
    
    let auxObjRef = globalConfig["ArchitectureSelfAwarenessIoT"];
    for (let i = 1; i < refList.length; i++) {
        let str = refList[i];
        auxObjRef = auxObjRef[str.split(".")[0]][str.split(".")[1]];
        references.push(auxObjRef);
    }
    return references;
};

// Intervalos de tiempo para la ejecucion de la api, durante que
exports.getTiempo = function(globalConfig,api){
    var linkdataf;
    if(api.$.hasLinkAPIToIoTDevice){
        linkdataf=globalConfig["ArchitectureSelfAwarenessIoT"].containsLink[api.$.hasLinkAPIToIoTDevice.split(".")[1]].$.supports;
    }else{
        linkdataf=globalConfig["ArchitectureSelfAwarenessIoT"].containsLink[api.$.hasLinkServiceToAPI.split(".")[1]].$.supports;
    }
    var dataf=globalConfig["ArchitectureSelfAwarenessIoT"].containsDataFlow[linkdataf.split(".")[1]];
    var unidad=dataf.$.unitOfTime;
    var inter=dataf.$.flowExecutionTimeInterval;
    var mult;
    switch (unidad){
        case "Second":
            mult=1000;
            break;
        case "Minute":
            mult=60000;
            break;
        default:
                mult=1;
            break;
    }
    return inter*mult;
    
};


function getReferences(globalConfig,index){
    const references = [];
    const link = globalConfig["ArchitectureSelfAwarenessIoT"].containsLink[index];
    let refList = [];
    if (link.$.linksService) refList = link.$.linksService.split("/@");
    else if (link.$.linkService) refList = link.$.linkService.split("/@");
    else if (link.$.linksTopic) refList = link.$.linksTopic.split("/@");
    let auxObjRef = globalConfig["ArchitectureSelfAwarenessIoT"];
    for (let i = 1; i < refList.length; i++) {
        let str = refList[i];
        auxObjRef = auxObjRef[str.split(".")[0]][str.split(".")[1]];
        references.push(auxObjRef);
    }
    return references;
}

function getLocalProtocol (globalConfig, index, index2) {
    const protocolList = globalConfig["ArchitectureSelfAwarenessIoT"].containsEntity[index].containsProtocol;
    if (protocolList && protocolList.length > 0) {
        const protocol = protocolList[index2];
        if (protocol) {
            return {
                port: protocol.$.port,
                name: protocol.$.name
            };
        } else {
            return "";
        }
    }
}

exports.getServiceURI = function (globalConfig, index){
    const references = getReferences(globalConfig, index);
    let middleware, service, network, node;
    if (references && references.length > 2) {
        service = references[references.length - 1];
        middleware = references[references.length - 2];
        node = references[references.length - 3];
        node && node.containsResource.forEach(resource => {
            if (resource.$["xsi:type"] === "MonitorIoT:NetworkInterface") {
                network = resource;
            }
        });
        if (service && middleware && node && network) {
            let protocol = {};
            const protocolRef = middleware.$.usesProtocol.split("/@");
            if (protocolRef.length > 0) {
                let index = 0;
                const auxList = protocolRef[1].split(".");
                index = auxList[1];
                let index2= protocolRef[2].split(".")[1];
                protocol = getLocalProtocol(globalConfig, index, index2);
            }
            const url = "http://" + network.$.networkAddress + ":" + protocol.port + "/" + service.$.endPoint;             
            return url;
        } else {
            return "";
        }
    } else {
        return "";
    }
};

/* const data = require("../../../modelos/modeloJSON.json");
console.log(data);
//extraer los procesos de autconsciencia
const procesosenjson = buscarValor(modelo, "ControlAmbiental", 8); //corregir que la busqueda no sea 'Control Ambiental'
console.log(procesosenjson);  */


//VER BIEN COMO IMPORTAR ESTAS FUNCIONES
function buscarValor(objeto, parametro, nivel) {
    const resultados = [];
    const arrayformat = [];
    const pila = [{ objeto, objetoPadre: null, keyPadre: null }];
    while (pila.length > 0) {
      const { objeto: obj, objetoPadre, keyPadre } = pila.pop();
      for (const key in obj) {
        if (obj[key] === parametro) {
          const resultado = {
            // tipo: obj[key],
            objetoPadre: Object.assign({}, objetoPadre, { [keyPadre]: obj }),
          };
          resultados.push(resultado);
        } else if (typeof obj[key] === "object") {
          pila.push({ objeto: obj[key], objetoPadre: obj, keyPadre: key });
        }
      }
    }
    for (let i = 0; i < resultados.length; i++) {
      //recorrer el arreglo resultados si se encontro mas de una coincidencia del parametro y trabajar con cada una
      objetoPadreActual = resultados[i].objetoPadre; //obtener la instancia de objeto padre
      //Separar objetoPadreActual en el numero de niveles indicado
      let objNivelesEstruct = estructurarObj(objetoPadreActual, nivel);
      arrayformat.push(objNivelesEstruct);
    }
    return arrayformat;
}

exports.getReferencestrace =function(globalConfig,ruta){
    const references = [];
    let refList = [];
    refList=ruta.split("/@");
    let auxObjRef = globalConfig["ArchitectureSelfAwarenessIoT"];
    for (let i = 1; i < refList.length; i++) {
        let str = refList[i];
        auxObjRef = auxObjRef[str.split(".")[0]][str.split(".")[1]];
        references.push(auxObjRef);
    }
    return references;    
};

exports.getBrokerURI = function(globalConfig, index){
    const references = getReferences(globalConfig, index);
    let broker, network, node;
    if (references && references.length > 2) {
        broker = references[references.length - 2];
        node = references[references.length - 3];
        node && node.containsResource.forEach(resource => {
            if (resource.$["xsi:type"] === "MonitorIoT:NetworkInterface") {
                network = resource;
            }
        });
        if (broker && node && network) {
            let protocol = {};
            const protocolRef = broker.$.usesProtocol.split("/@");
            if (protocolRef.length > 0) {
                let index = 0;
                const auxList = protocolRef[1].split(".");
                index = auxList[1];
                let index2= protocolRef[2].split(".")[1];
                protocol = getLocalProtocol(globalConfig, index, index2);
            }
            const url = protocol.name.toLowerCase() + "://" + network.$.networkAddress + ":" + protocol.port;
            return url;
        } else {
            return "";
        }
    } else {
        return "";
    }
};

exports.getTopic = function(globalConfig, index){
    const link = globalConfig["ArchitectureSelfAwarenessIoT"].containsLink[index];
    if (link.$.linksTopic) {
        let auxList = link.$.linksTopic.split("/@");
        let auxObj = globalConfig["ArchitectureSelfAwarenessIoT"];
        for (let i = 1; i < auxList.length; i++){
            let str = auxList[i];
            auxObj = auxObj[str.split(".")[0]][str.split(".")[1]];
        }
        topic = auxObj;
    }
    return topic;   
    
};